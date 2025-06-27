import http from '../lib/http'
import { webSocketClient, type WebSocketMessage } from '../utils/websocket'
import type { ApiResponse } from '../types/api'

export interface ChatInfo {
  id: string
  name: string
  type: 'SINGLE' | 'GROUP'
  memberCount?: number
  lastMessage?: string
  lastMessageTime?: string
}

export interface ChatListResponse {
  chats: ChatInfo[]
}

// 添加聊天列表接口的返回类型，对应后端的 ChatInfoDTO
export interface ChatInfoDTO {
  id: string
  chatType: 'SINGLE' | 'GROUP'
  title: string
  avatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  online: boolean
}

// 添加消息DTO类型，对应后端的 MessageDTO
export interface MessageDTO {
  id: string
  chatId: string
  sender: SimpleUserDTO
  senderType: 'me' | 'other'  // 添加senderType字段
  type: 'TEXT' | 'IMAGE' | 'FILE'
  content: string
  sentTime: string
  read: boolean
  readTime?: string
}

// 简单用户信息DTO
export interface SimpleUserDTO {
  id: string
  openId: string
  nickName: string
  avatar?: string
}

// 添加分页返回类型，对应后端的 Slices
export interface Slices<T> {
  items: T[]
  hasNext: boolean
  lastId?: string
  size: number
}

// 聊天消息查询参数
export interface ChatMessagesQueryParam {
  chatId: string
  before?: string  // 分页游标，查询在此ID之前的消息
  after?: string   // 分页游标，查询在此ID之后的消息
  pageSize: number
}

export interface SendMessageRequest {
  chatId: string
  content: string
  messageType?: 'TEXT' | 'IMAGE' | 'FILE'
}

export class ChatService {
  private isInitialized = false

  /**
   * 初始化聊天服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 建立WebSocket连接
      await webSocketClient.connect()
      this.isInitialized = true
      console.log('聊天服务初始化成功')
    } catch (error) {
      console.error('聊天服务初始化失败:', error)
      throw error
    }
  }

  /**
   * 销毁聊天服务
   */
  destroy(): void {
    webSocketClient.disconnect()
    this.isInitialized = false
    console.log('聊天服务已销毁')
  }

  /**
   * 检查服务是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized && webSocketClient.isConnected()
  }

  /**
   * 获取聊天列表
   * @param lastId 上次查询的最后一个聊天ID，用于分页
   * @param pageSize 每页大小，默认20
   */
  async getChatList(lastId?: string, pageSize?: number): Promise<Slices<ChatInfoDTO>> {
    try {
      const params = new URLSearchParams()
      if (lastId) {
        params.append('lastId', lastId)
      }
      if (pageSize) {
        params.append('pageSize', pageSize.toString())
      }
      
      const url = `/chats${params.toString() ? `?${params.toString()}` : ''}`
      const response = await http.get<ApiResponse<Slices<ChatInfoDTO>>>(url)
      
      if (response.data.success !== false && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.msg || '获取聊天列表失败')
      }
    } catch (error) {
      console.error('获取聊天列表失败:', error)
      throw error
    }
  }

  /**
   * 获取聊天消息
   * @param param 查询参数
   */
  async getChatMessages(param: ChatMessagesQueryParam): Promise<Slices<MessageDTO>> {
    try {
      const params = new URLSearchParams()
      if (param.before) {
        params.append('before', param.before)
      }
      if (param.after) {
        params.append('after', param.after)
      }
      params.append('pageSize', param.pageSize.toString())
      
      const url = `/chats/messages/${param.chatId}?${params.toString()}`
      const response = await http.get<ApiResponse<Slices<MessageDTO>>>(url)
      
      if (response.data.success !== false && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.msg || '获取聊天消息失败')
      }
    } catch (error) {
      console.error('获取聊天消息失败:', error)
      throw error
    }
  }

  /**
   * 获取群聊列表
   */
  async getGroupChats(): Promise<string[]> {
    try {
      const response = await http.get<ApiResponse<string[]>>('/chats/groupChats')
      
      if (response.data.success !== false && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.msg || '获取群聊列表失败')
      }
    } catch (error) {
      console.error('获取群聊列表失败:', error)
      throw error
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(request: SendMessageRequest): Promise<void> {
    if (!this.isReady()) {
      throw new Error('聊天服务未就绪，请先初始化')
    }

    const message: WebSocketMessage = {
      chatId: request.chatId,
      content: request.content,
      messageType: request.messageType || 'TEXT'
    }

    webSocketClient.sendMessage(message)
  }

  /**
   * 订阅群聊
   */
  subscribeToGroupChat(chatId: string): void {
    if (!this.isReady()) {
      console.warn('聊天服务未就绪，无法订阅群聊')
      return
    }

    webSocketClient.subscribeToGroupChat(chatId)
  }

  /**
   * 取消订阅群聊
   */
  unsubscribeFromGroupChat(chatId: string): void {
    webSocketClient.unsubscribeFromGroupChat(chatId)
  }

  /**
   * 添加消息处理器
   */
  addMessageHandler(handler: (message: WebSocketMessage) => void): void {
    webSocketClient.addMessageHandler(handler)
  }

  /**
   * 移除消息处理器
   */
  removeMessageHandler(handler: (message: WebSocketMessage) => void): void {
    webSocketClient.removeMessageHandler(handler)
  }

  /**
   * 重新连接
   */
  async reconnect(): Promise<void> {
    webSocketClient.disconnect()
    this.isInitialized = false
    await this.initialize()
  }
}

// 创建全局聊天服务实例
export const chatService = new ChatService()

// 导出默认实例
export default chatService 