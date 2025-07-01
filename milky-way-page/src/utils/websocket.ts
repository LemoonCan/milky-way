import { Client, StompConfig } from '@stomp/stompjs'
import type { IMessage, StompSubscription } from '@stomp/stompjs'
import { tokenManager } from '../lib/http'
import type { MessageDTO } from '../types/api'

export interface WebSocketMessage {
  chatId: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE'
  content: string
  clientMsgId?: string // 客户端消息ID，用于回执匹配
  senderUserId?: string
  timestamp?: string
}

export interface MessageDTOHandler {
  (message: MessageDTO): void
}

export interface MessageHandler {
  (message: WebSocketMessage): void
}

// 消息回执处理器接口
export interface MessageReceiptHandler {
  (receipt: MessageReceipt): void
}

// 消息回执类型
export interface MessageReceipt {
  success: boolean
  code: string
  msg: string
  data?: {
    id: string
    clientMsgId?: string
    chatId: string
    [key: string]: unknown
  }
}

// 连接状态枚举
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RETRYING = 'retrying',
  FAILED = 'failed'
}

// 重试状态接口
export interface RetryInfo {
  currentAttempt: number
  maxAttempts: number
  status: ConnectionStatus
  error?: string
}

export class WebSocketClient {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private messageHandlers: Set<MessageHandler> = new Set()
  private messageDTOHandlers: Set<MessageDTOHandler> = new Set()
  private receiptHandlers: Set<MessageReceiptHandler> = new Set()
  
  // 简化状态管理
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED
  private retryInfo: RetryInfo = {
    currentAttempt: 0,
    maxAttempts: 2,
    status: ConnectionStatus.DISCONNECTED
  }
  
  private retryTimeoutId: number | null = null
  private statusChangeCallback: ((retryInfo: RetryInfo) => void) | null = null
  private connectionCheckInterval: number | null = null
  
  // 重试延迟配置（毫秒）
  private readonly retryDelays = [3000, 15000] // 修改：因为只有2次重试，所以只配置2个延迟值：3秒, 15秒

  constructor() {
    // 构造函数保持简单，不自动连接
    console.log('[WebSocket] WebSocket客户端实例已创建')
    this.startConnectionCheck()
  }

  /**
   * 设置状态变更回调
   */
  public setStatusChangeCallback(callback: (retryInfo: RetryInfo) => void) {
    this.statusChangeCallback = callback
  }

  /**
   * 通知状态变更
   */
  private notifyStatusChange() {
    if (this.statusChangeCallback) {
      this.statusChangeCallback({ ...this.retryInfo })
    }
  }

  /**
   * 更新状态
   */
  private updateStatus(status: ConnectionStatus, error?: string) {
    console.log(`[WebSocket] 状态更新: ${this.status} -> ${status}, 重试次数: ${this.retryInfo.currentAttempt}/${this.retryInfo.maxAttempts}`)
    this.status = status
    this.retryInfo.status = status
    if (error) {
      this.retryInfo.error = error
      console.log(`[WebSocket] 错误信息: ${error}`)
    }
    this.notifyStatusChange()
  }

  /**
   * 创建STOMP客户端
   */
  private createClient(): Client {
    const token = tokenManager.getToken()
    if (!token) {
      throw new Error('未找到认证token，无法建立WebSocket连接')
    }

    console.log('[WebSocket] 创建新的STOMP客户端，token存在:', !!token)

    const config: StompConfig = {
      brokerURL: `wss://localhost:8081/ws?authToken=${encodeURIComponent(token)}`,
      connectHeaders: {
        'accept-version': '1.2',
        'host': 'localhost:8081'
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: 0, // 禁用自动重连，我们手动控制
      debug: (str) => {
        console.log('[STOMP Debug]', str)
      },
      onConnect: (frame) => {
        console.log('[WebSocket] 连接成功', frame)
        this.onConnected()
      },
      onDisconnect: (frame) => {
        console.log('[WebSocket] 连接断开', frame)
        if (this.status !== ConnectionStatus.FAILED) {
          this.onDisconnected('连接意外断开')
        }
      },
      onWebSocketError: (error) => {
        console.error('[WebSocket] WebSocket错误:', error)
        this.onConnectionError('WebSocket错误')
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP错误:', frame)
        this.onConnectionError('STOMP协议错误')
      }
    }

    return new Client(config)
  }

  /**
   * 连接成功处理
   */
  private onConnected() {
    this.retryInfo.currentAttempt = 0
    this.updateStatus(ConnectionStatus.CONNECTED)
    this.clearRetryTimeout()
    
    // 重新启动连接状态检查
    this.stopConnectionCheck()
    this.startConnectionCheck()
    
    // 订阅消息
    this.subscribeToPersonalMessages()
    this.subscribeToMessageReceipts()
    this.subscribeToGroupChats()
  }

  /**
   * 连接断开处理
   */
  private onDisconnected(reason: string) {
    console.log(`[WebSocket] 处理连接断开: ${reason}, 当前状态: ${this.status}`)
    
    // 停止连接状态检查
    this.stopConnectionCheck()
    
    // 清除任何正在进行的重试
    this.clearRetryTimeout()
    
    // 重置重试计数器
    this.retryInfo.currentAttempt = 0
    
    // 设置为未连接状态（除非已经是失败状态）
    if (this.status !== ConnectionStatus.FAILED) {
      this.updateStatus(ConnectionStatus.DISCONNECTED, reason)
    }
  }

  /**
   * 连接错误处理
   */
  private onConnectionError(error: string) {
    if (this.status === ConnectionStatus.CONNECTING) {
      // 首次连接失败
      this.startRetry(error)
    } else if (this.status === ConnectionStatus.RETRYING) {
      // 重试连接失败
      this.handleRetryFailure(error)
    }
  }

  /**
   * 开始重试
   */
  private startRetry(error: string) {
    if (this.retryInfo.currentAttempt >= this.retryInfo.maxAttempts) {
      this.updateStatus(ConnectionStatus.FAILED, `连接失败: ${error}`)
      return
    }

    this.retryInfo.currentAttempt++
    this.updateStatus(ConnectionStatus.RETRYING, error)

    const delay = this.retryDelays[this.retryInfo.currentAttempt - 1]
    console.log(`[WebSocket] 第${this.retryInfo.currentAttempt}次重试，${delay/1000}秒后执行`)

    this.retryTimeoutId = window.setTimeout(() => {
      this.performRetry()
    }, delay)
  }

  /**
   * 执行重试
   */
  private async performRetry() {
    this.clearRetryTimeout()
    console.log(`[WebSocket] 执行第${this.retryInfo.currentAttempt}次重试`)

    try {
      await this.connectInternal()
    } catch (error) {
      console.error(`[WebSocket] 第${this.retryInfo.currentAttempt}次重试失败:`, error)
      this.handleRetryFailure(error instanceof Error ? error.message : '重试连接失败')
    }
  }

  /**
   * 处理重试失败
   */
  private handleRetryFailure(error: string) {
    if (this.retryInfo.currentAttempt >= this.retryInfo.maxAttempts) {
      console.log(`[WebSocket] 已达到最大重试次数 (${this.retryInfo.maxAttempts})，停止重试`)
      this.updateStatus(ConnectionStatus.FAILED, `所有重试都失败: ${error}`)
      // 确保清理所有定时器和状态检查
      this.clearRetryTimeout()
      this.stopConnectionCheck()
    } else {
      // 继续下一次重试
      this.startRetry(error)
    }
  }

  /**
   * 清除重试定时器
   */
  private clearRetryTimeout() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }
  }

  /**
   * 内部连接方法
   */
  private async connectInternal(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client) {
        this.client.deactivate()
      }

      this.client = this.createClient()

      // 设置一次性连接结果处理
      const originalOnConnect = this.client.onConnect
      const originalOnWebSocketError = this.client.onWebSocketError

      this.client.onConnect = (frame) => {
        originalOnConnect(frame)
        resolve()
      }

      this.client.onWebSocketError = (error) => {
        originalOnWebSocketError(error)
        reject(new Error('WebSocket连接失败'))
      }

      // 激活连接
      this.client.activate()
    })
  }

  /**
   * 公共连接方法
   */
  public async connect(): Promise<void> {
    console.log('🔄 [WebSocket] connect() 被调用，当前状态:', this.status)
    
    if (this.status === ConnectionStatus.CONNECTING || this.status === ConnectionStatus.RETRYING) {
      console.log('⏳ [WebSocket] 连接已在进行中，忽略重复调用')
      return
    }

    if (this.isConnected()) {
      console.log('✅ [WebSocket] 已连接，无需重复连接')
      return
    }

    // 修改：只在以下情况重置重试计数器：
    // 1. 当前状态是 DISCONNECTED（初次连接或主动断开后）
    // 2. 当前状态是 FAILED 但重试次数已达上限，需要用户主动触发重连
    if (this.status === ConnectionStatus.DISCONNECTED || 
        (this.status === ConnectionStatus.FAILED && this.retryInfo.currentAttempt >= this.retryInfo.maxAttempts)) {
      console.log('🚀 [WebSocket] 重置重试计数器，开始新的连接尝试')
      this.retryInfo.currentAttempt = 0
      this.retryInfo.error = undefined
    } else {
      console.log('🔄 [WebSocket] 继续当前的连接尝试，不重置计数器')
    }
    
    this.updateStatus(ConnectionStatus.CONNECTING)

    try {
      console.log('🔗 [WebSocket] 调用 connectInternal()')
      await this.connectInternal()
      console.log('✅ [WebSocket] connectInternal() 完成')
    } catch (error) {
      console.error('❌ [WebSocket] 首次连接失败:', error)
      this.onConnectionError(error instanceof Error ? error.message : '连接失败')
    }
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    console.log('[WebSocket] 主动断开连接，当前状态:', this.status)
    this.clearRetryTimeout()
    
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe()
      })
      this.subscriptions.clear()
      this.client.deactivate()
    }
    
    this.retryInfo.currentAttempt = 0
    this.updateStatus(ConnectionStatus.DISCONNECTED)
    this.stopConnectionCheck()
  }

  /**
   * 重置连接
   */
  public async reset(): Promise<void> {
    console.log('🔄 [WebSocket] reset() 开始，当前状态:', this.status)
    console.log('🔌 [WebSocket] 先断开现有连接')
    this.disconnect()
    console.log('🔗 [WebSocket] 重新建立连接')
    await this.connect()
    console.log('✅ [WebSocket] reset() 完成，最终状态:', this.status)
  }

  /**
   * 检查连接状态
   */
  public isConnected(): boolean {
    const actuallyConnected = this.client?.connected || false
    const statusConnected = this.status === ConnectionStatus.CONNECTED
    
    // 如果当前状态是 FAILED，不进行状态同步，避免触发重连
    if (this.status === ConnectionStatus.FAILED) {
      console.log(`[WebSocket] 当前状态为 FAILED，不进行状态同步`)
      return false
    }
    
    // 如果实际连接状态和我们的状态不一致，需要同步
    if (actuallyConnected !== statusConnected) {
      console.log(`[WebSocket] 状态不同步 - 实际连接: ${actuallyConnected}, 状态: ${this.status}`)
      if (!actuallyConnected && statusConnected) {
        // 实际断开但状态显示连接，更新状态
        this.onDisconnected('检测到连接已断开')
      }
    }
    
    return actuallyConnected
  }

  /**
   * 获取连接状态
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.status
  }

  /**
   * 获取重试信息
   */
  public getRetryInfo(): RetryInfo {
    return { ...this.retryInfo }
  }

  /**
   * 订阅个人消息队列
   */
  private subscribeToPersonalMessages() {
    if (!this.client || !this.isConnected()) return

    const subscriptionId = `personal-messages-${Date.now()}`
    
    try {
      const subscription = this.client.subscribe(
        '/user/queue/messages',
        (message: IMessage) => {
          try {
            const messageData: MessageDTO = JSON.parse(message.body)
            this.handleMessageDTO(messageData)
          } catch (error) {
            console.error('解析个人消息失败:', error)
          }
        },
        {
          id: subscriptionId,
          ack: 'auto'
        }
      )

      this.subscriptions.set('personal', subscription)
      console.log('[WebSocket] 已订阅个人消息队列')
    } catch (error) {
      console.error('[WebSocket] 订阅个人消息失败:', error)
    }
  }

  /**
   * 订阅消息发送回执
   */
  private subscribeToMessageReceipts() {
    if (!this.client || !this.isConnected()) return

    const subscriptionId = `message-receipts-${Date.now()}`
    
    try {
      const subscription = this.client.subscribe(
        '/user/queue/receipts',
        (message: IMessage) => {
          try {
            const receiptData = JSON.parse(message.body)
            this.handleMessageReceipt(receiptData)
          } catch (error) {
            console.error('解析消息回执失败:', error)
          }
        },
        {
          id: subscriptionId,
          ack: 'auto'
        }
      )

      this.subscriptions.set('receipts', subscription)
      console.log('[WebSocket] 已订阅消息回执队列')
    } catch (error) {
      console.error('[WebSocket] 订阅消息回执失败:', error)
    }
  }

  /**
   * 订阅群聊频道
   */
  private async subscribeToGroupChats() {
    try {
      // 获取群聊列表
      const response = await fetch('https://localhost:8081/chats/groupChats', {
        headers: {
          'Authorization': `Bearer ${tokenManager.getToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`获取群聊列表失败: ${response.status}`)
      }

      const result = await response.json()
      if (result.success !== false && result.data) {
        const groupChatIds: string[] = result.data
        
        groupChatIds.forEach((chatId) => {
          this.subscribeToGroupChat(chatId)
        })
      }
    } catch (error) {
      console.error('[WebSocket] 获取群聊列表失败:', error)
    }
  }

  /**
   * 订阅单个群聊
   */
  public subscribeToGroupChat(chatId: string) {
    if (!this.client || !this.isConnected()) {
      console.warn('[WebSocket] 未连接，无法订阅群聊:', chatId)
      return
    }

    const subscriptionId = `group-chat-${chatId}-${Date.now()}`
    
    try {
      const subscription = this.client.subscribe(
        `/topic/groupChat/${chatId}`,
        (message: IMessage) => {
          try {
            // 修复: 群聊消息应该解析为MessageDTO类型，与单聊保持一致
            const messageData: MessageDTO = JSON.parse(message.body)
            this.handleMessageDTO(messageData)
          } catch (error) {
            console.error('解析群聊消息失败:', error)
          }
        },
        {
          id: subscriptionId,
          ack: 'auto'
        }
      )

      this.subscriptions.set(`group-${chatId}`, subscription)
      console.log('[WebSocket] 已订阅群聊:', chatId)
    } catch (error) {
      console.error('[WebSocket] 订阅群聊失败:', chatId, error)
    }
  }

  /**
   * 取消订阅群聊
   */
  public unsubscribeFromGroupChat(chatId: string) {
    const subscriptionKey = `group-${chatId}`
    const subscription = this.subscriptions.get(subscriptionKey)
    
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(subscriptionKey)
      console.log('[WebSocket] 已取消订阅群聊:', chatId)
    }
  }

  /**
   * 发送消息
   */
  public sendMessage(message: WebSocketMessage): void {
    if (!this.client || !this.isConnected()) {
      console.error('[WebSocket] 未连接，无法发送消息')
      throw new Error('WebSocket未连接')
    }

    try {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message),
        headers: {
          'content-type': 'application/json'
        }
      })
      console.log('[WebSocket] 消息发送成功:', message)
    } catch (error) {
      console.error('[WebSocket] 发送消息失败:', error)
      throw error
    }
  }

  /**
   * 添加消息处理器
   */
  public addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.add(handler)
  }

  /**
   * 移除消息处理器
   */
  public removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.delete(handler)
  }

  /**
   * 添加MessageDTO处理器
   */
  public addMessageDTOHandler(handler: MessageDTOHandler): void {
    this.messageDTOHandlers.add(handler)
  }

  /**
   * 移除MessageDTO处理器
   */
  public removeMessageDTOHandler(handler: MessageDTOHandler): void {
    this.messageDTOHandlers.delete(handler)
  }

  /**
   * 添加回执处理器
   */
  public addReceiptHandler(handler: MessageReceiptHandler): void {
    this.receiptHandlers.add(handler)
  }

  /**
   * 移除回执处理器
   */
  public removeReceiptHandler(handler: MessageReceiptHandler): void {
    this.receiptHandlers.delete(handler)
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('[WebSocket] 收到消息:', message)
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('[WebSocket] 处理消息时出错:', error)
      }
    })
  }

  /**
   * 处理接收到的MessageDTO
   */
  private handleMessageDTO(message: MessageDTO): void {
    console.log('[WebSocket] 收到MessageDTO:', message)
    this.messageDTOHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('[WebSocket] 处理MessageDTO时出错:', error)
      }
    })
  }

  /**
   * 处理接收到的消息回执
   */
  private handleMessageReceipt(receipt: MessageReceipt): void {
    console.log('[WebSocket] 收到消息回执:', receipt)
    this.receiptHandlers.forEach(handler => {
      try {
        handler(receipt)
      } catch (error) {
        console.error('[WebSocket] 处理消息回执时出错:', error)
      }
    })
  }

  /**
   * 启动连接状态检查
   */
  private startConnectionCheck() {
    // 每5秒检查一次连接状态，但不自动重连
    this.connectionCheckInterval = window.setInterval(() => {
      this.isConnected() // 调用isConnected会自动同步状态
    }, 5000)
  }

  /**
   * 停止连接状态检查
   */
  private stopConnectionCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval)
      this.connectionCheckInterval = null
    }
  }
}

// 创建全局WebSocket客户端实例
export const webSocketClient = new WebSocketClient() 