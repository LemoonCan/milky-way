import { Client, StompConfig, ActivationState } from '@stomp/stompjs'
import type { IMessage, StompSubscription } from '@stomp/stompjs'
import { tokenManager } from '../lib/http'
import type { MessageNotifyDTO } from '../types/api'
import type { MessageDTO } from './chat'
import EnvConfig from '../lib/env'

export interface WebSocketMessage {
  chatId: string
  messageType: 'SYSTEM' | 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO'
  content: string
  clientMsgId?: string // 客户端消息ID，用于回执匹配
  senderUserId?: string
  timestamp?: string
}

export interface NewMessageHandler {
  (message: MessageDTO): void
}

// 消息回执处理器接口
export interface MessageReceiptHandler {
  (receipt: MessageReceipt): void
}

// 通知处理器接口
export interface NotificationHandler {
  (notification: MessageNotifyDTO<unknown>): void
}

// 消息回执类型
export interface MessageReceipt {
  success: boolean
  code: string
  msg: string
  data: MessageDTO
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

// 状态变更回调接口
export interface StatusChangeHandler {
  (status: ConnectionStatus, error?: string): void
}

export class WebSocketClient {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private newMessageHandlers: Set<NewMessageHandler> = new Set()
  private receiptHandlers: Set<MessageReceiptHandler> = new Set()
  private notificationHandlers: Set<NotificationHandler> = new Set()
  
  // 移除重试相关状态，只保留状态回调
  private statusChangeHandler: StatusChangeHandler | null = null

  constructor() {
    console.log('[WebSocket] WebSocket客户端实例已创建')
  }

  /**
   * 设置状态变更回调
   */
  public setStatusChangeHandler(handler: StatusChangeHandler) {
    this.statusChangeHandler = handler
  }

  /**
   * 通知状态变更
   */
  private notifyStatusChange(status: ConnectionStatus, error?: string) {
    console.log(`[WebSocket] 状态更新: ${status}`)
    if (error) {
      console.log(`[WebSocket] 错误信息: ${error}`)
    }
    
    if (this.statusChangeHandler) {
      this.statusChangeHandler(status, error)
    }
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
      brokerURL: `${EnvConfig.WS_URL}?authToken=${encodeURIComponent(token)}`,
      connectHeaders: {
        'accept-version': '1.2',
        'host': EnvConfig.WS_HOST
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
        this.onDisconnected('连接意外断开')
      },
      onWebSocketError: (error) => {
        console.error('[WebSocket] WebSocket错误:', error)
        this.onConnectionError('WebSocket错误')
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP错误:', frame)
        this.onConnectionError('STOMP协议错误')
      },
      onWebSocketClose: (event) => {
        console.warn('[WebSocket] WebSocket连接关闭', event)
        this.onDisconnected('WebSocket连接关闭')
      },
      
      onChangeState: (state) => {
        console.log('[WebSocket] 状态变更:', state)
        if (state === ActivationState.INACTIVE) {
          this.onDisconnected('状态变为 INACTIVE')
        }
      },
    }

    return new Client(config)
  }

  /**
   * 连接成功处理
   */
  private onConnected() {
    this.notifyStatusChange(ConnectionStatus.CONNECTED)
    
    console.log('🎉 [WebSocket] 连接成功建立，开始订阅各种消息队列')
    
    // 订阅消息
    this.subscribeToPersonalMessages()
    this.subscribeToMessageReceipts()
    this.subscribeToNotifications()
    this.subscribeToGroupChats()
    
    console.log('✅ [WebSocket] 所有订阅完成，连接已就绪')
  }

  /**
   * 连接断开处理
   */
  private onDisconnected(reason: string) {
    console.log(`[WebSocket] 处理连接断开: ${reason}`)
    // 设置为未连接状态
    this.notifyStatusChange(ConnectionStatus.DISCONNECTED, reason)
  }

  /**
   * 连接错误处理
   */
  private onConnectionError(error: string) {
    console.error('[WebSocket] 连接错误:', error)
    this.notifyStatusChange(ConnectionStatus.FAILED, error)
  }

  /**
   * 单次连接尝试（不重试）
   */
  public async connect(): Promise<void> {
    console.log('🔄 [WebSocket] connect() 被调用')
    
    if (this.isConnected()) {
      console.log('✅ [WebSocket] 已连接，无需重复连接')
      return
    }

    this.notifyStatusChange(ConnectionStatus.CONNECTING)

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
   * 断开连接
   */
  public disconnect(): void {
    console.log('[WebSocket] 主动断开连接')
    
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe()
      })
      this.subscriptions.clear()
      this.client.deactivate()
    }
    
    this.notifyStatusChange(ConnectionStatus.DISCONNECTED)
  }

  /**
   * 检查连接状态
   */
  public isConnected(): boolean {
    return this.client?.connected || false
  }

  /**
   * 获取当前连接信息（简化版）
   */
  public getConnectionInfo() {
    return {
      connected: this.isConnected()
    }
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
            this.handleNewMessage(messageData)
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
   * 订阅通知队列
   */
  private subscribeToNotifications() {
    if (!this.client || !this.isConnected()) return

    const subscriptionId = `notifications-${Date.now()}`
    
    try {
      const subscription = this.client.subscribe(
        '/user/queue/notifications',
        (message: IMessage) => {
          try {
            const notificationData: MessageNotifyDTO<unknown> = JSON.parse(message.body)
            this.handleNotification(notificationData)
          } catch (error) {
            console.error('解析通知消息失败:', error)
          }
        },
        {
          id: subscriptionId,
          ack: 'auto'
        }
      )

      this.subscriptions.set('notifications', subscription)
      console.log('[WebSocket] 已订阅通知队列')
    } catch (error) {
      console.error('[WebSocket] 订阅通知队列失败:', error)
    }
  }

  /**
   * 订阅群聊频道
   */
  private async subscribeToGroupChats() {
    try {
      // 获取群聊列表
      const response = await fetch(`${EnvConfig.API_BASE_URL}/chats/groupChats`, {
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
            const messageData: MessageDTO = JSON.parse(message.body)
            this.handleNewMessage(messageData)
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
   * 添加NewMessage处理器
   */
  public addNewMessageHandler(handler: NewMessageHandler): void {
    this.newMessageHandlers.add(handler)
  }

  /**
   * 移除NewMessage处理器
   */
  public removeNewMessageHandler(handler: NewMessageHandler): void {
    this.newMessageHandlers.delete(handler)
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
   * 添加通知处理器
   */
  public addNotificationHandler(handler: NotificationHandler): void {
    this.notificationHandlers.add(handler)
  }

  /**
   * 移除通知处理器
   */
  public removeNotificationHandler(handler: NotificationHandler): void {
    this.notificationHandlers.delete(handler)
  }

  /**
   * 处理接收到的NewMessage
   */
  private handleNewMessage(message: MessageDTO): void {
    console.log('[WebSocket] 收到NewMessage:', message)
    this.newMessageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('[WebSocket] 处理NewMessage时出错:', error)
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
   * 处理接收到的通知
   */
  private handleNotification(notification: MessageNotifyDTO<unknown>): void {
    console.log('[WebSocket] 收到通知:', notification)
    this.notificationHandlers.forEach(handler => {
      try {
        handler(notification)
      } catch (error) {
        console.error('[WebSocket] 处理通知时出错:', error)
      }
    })
  }

}

// 创建全局WebSocket客户端实例
export const webSocketClient = new WebSocketClient() 