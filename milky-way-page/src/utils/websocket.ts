import { Client, StompConfig } from '@stomp/stompjs'
import type { IMessage, StompSubscription } from '@stomp/stompjs'
import { tokenManager } from '../lib/http'

export interface WebSocketMessage {
  chatId: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE'
  content: string
  senderUserId?: string
  timestamp?: string
}

export interface MessageHandler {
  (message: WebSocketMessage): void
}

export class WebSocketClient {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private messageHandlers: Set<MessageHandler> = new Set()
  private reconnectDelay = 3000
  private isConnecting = false

  constructor() {
    this.setupClient()
  }

  private setupClient() {
    const token = tokenManager.getToken()
    if (!token) {
      console.warn('未找到认证token，无法建立WebSocket连接')
      return
    }

    const config: StompConfig = {
      brokerURL: `wss://localhost:8081/ws?authToken=${encodeURIComponent(token)}`,
      connectHeaders: {
        'accept-version': '1.2',
        'host': 'localhost:8081'
      },
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: this.reconnectDelay,
      debug: (str) => {
        console.log('[STOMP Debug]', str)
      },
      onConnect: (frame) => {
        console.log('WebSocket连接成功', frame)
        this.isConnecting = false
        this.subscribeToPersonalMessages()
        this.subscribeToGroupChats()
      },
      onDisconnect: (frame) => {
        console.log('WebSocket连接断开', frame)
        this.isConnecting = false
      },
      onWebSocketError: (error) => {
        console.error('WebSocket错误:', error)
        this.isConnecting = false
      },
      onStompError: (frame) => {
        console.error('STOMP错误:', frame)
        this.isConnecting = false
      }
    }

    this.client = new Client(config)
  }

  /**
   * 连接WebSocket
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        this.setupClient()
      }

      if (this.isConnected()) {
        resolve()
        return
      }

      if (this.isConnecting) {
        // 如果正在连接中，等待连接完成
        const checkConnection = () => {
          if (this.isConnected()) {
            resolve()
          } else if (!this.isConnecting) {
            reject(new Error('连接失败'))
          } else {
            setTimeout(checkConnection, 100)
          }
        }
        checkConnection()
        return
      }

      this.isConnecting = true

      const originalOnConnect = this.client!.onConnect
      const originalOnWebSocketError = this.client!.onWebSocketError

      this.client!.onConnect = (frame) => {
        originalOnConnect(frame)
        resolve()
      }

      this.client!.onWebSocketError = (error) => {
        originalOnWebSocketError(error)
        reject(error)
      }

      try {
        this.client!.activate()
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe()
      })
      this.subscriptions.clear()
      this.client.deactivate()
    }
  }

  /**
   * 检查连接状态
   */
  public isConnected(): boolean {
    return this.client?.connected || false
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
            const messageData: WebSocketMessage = JSON.parse(message.body)
            this.handleMessage(messageData)
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
      console.log('已订阅个人消息队列')
    } catch (error) {
      console.error('订阅个人消息失败:', error)
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
      console.error('获取群聊列表失败:', error)
    }
  }

  /**
   * 订阅单个群聊
   */
  public subscribeToGroupChat(chatId: string) {
    if (!this.client || !this.isConnected()) return

    const destination = `/topic/groupChat/${chatId}`
    const subscriptionId = `group-${chatId}-${Date.now()}`

    try {
      const subscription = this.client.subscribe(
        destination,
        (message: IMessage) => {
          try {
            const messageData: WebSocketMessage = JSON.parse(message.body)
            this.handleMessage(messageData)
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
      console.log(`已订阅群聊: ${chatId}`)
    } catch (error) {
      console.error(`订阅群聊失败 ${chatId}:`, error)
    }
  }

  /**
   * 取消订阅群聊
   */
  public unsubscribeFromGroupChat(chatId: string) {
    const key = `group-${chatId}`
    const subscription = this.subscriptions.get(key)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(key)
      console.log(`已取消订阅群聊: ${chatId}`)
    }
  }

  /**
   * 发送消息
   */
  public sendMessage(message: WebSocketMessage): void {
    if (!this.client || !this.isConnected()) {
      console.error('WebSocket未连接，无法发送消息')
      return
    }

    try {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          chatId: message.chatId,
          messageType: message.messageType,
          content: message.content
        }),
        headers: {
          'content-type': 'application/json'
        }
      })
      
      console.log('消息发送成功:', message)
    } catch (error) {
      console.error('发送消息失败:', error)
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
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('收到消息:', message)
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message)
      } catch (error) {
        console.error('消息处理器执行失败:', error)
      }
    })
  }
}

// 创建全局WebSocket客户端实例
export const webSocketClient = new WebSocketClient() 