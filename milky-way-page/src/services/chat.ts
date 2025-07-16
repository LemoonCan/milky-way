import http from '../lib/http'
import { webSocketClient, type WebSocketMessage, type MessageDTOHandler, type RetryInfo, ConnectionStatus } from '../utils/websocket'
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
  clientMsgId?: string // 客户端消息ID，用于回执匹配
  chatId: string
  sender: SimpleUserDTO
  meta: {
    type: 'SYSTEM' | 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO'
    content: string
    media?: string | null
    videoUrl?: string // 真实视频URL，用于视频消息类型
  }
  sentTime: string
  read?: boolean
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
  messageType?: 'SYSTEM' | 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO'
  clientMsgId?: string // 客户端消息ID，用于回执匹配
}

// 添加消息标记已读请求参数接口
export interface MessageReadRequest {
  chatId: string
  messageId: string
}

// 创建群聊请求参数
export interface CreateGroupChatRequest {
  chatType: 'SINGLE' | 'GROUP'
  title: string
  members: string[]
}

// 聊天DTO返回类型
export interface ChatDTO {
  id: string
  chatType: 'SINGLE' | 'GROUP'
  title: string
  avatar?: string
  memberCount?: number
}

export class ChatService {
  private isInitialized = false

  /**
   * 初始化聊天服务
   */
  async initialize(): Promise<void> {
    console.log('🔄 [ChatService] initialize() 开始...')
    
    // 检查是否真正连接，而不只是初始化标志
    if (this.isInitialized && webSocketClient.isConnected()) {
      console.log('✅ [ChatService] 服务已初始化且WebSocket已连接，跳过')
      return
    }

    console.log('🔧 [ChatService] 重置初始化状态')
    this.isInitialized = false

    try {
      console.log('🔗 [ChatService] 调用 webSocketClient.connect()')
      // 建立WebSocket连接
      await webSocketClient.connect()
      this.isInitialized = true
      console.log('🎉 [ChatService] 聊天服务初始化成功')
    } catch (error) {
      console.error('❌ [ChatService] 聊天服务初始化失败:', error)
      this.isInitialized = false  // 失败时确保标志为false
      throw error
    }
  }

  /**
   * 销毁聊天服务
   */
  destroy(): void {
    webSocketClient.disconnect()
    this.isInitialized = false
    console.log('[ChatService] 聊天服务已销毁')
  }

  /**
   * 检查服务是否已初始化
   */
  isReady(): boolean {
    const ready = this.isInitialized && webSocketClient.isConnected()
    console.log('🔍 [ChatService] isReady() 检查:', {
      isInitialized: this.isInitialized,
      isConnected: webSocketClient.isConnected(),
      ready
    })
    return ready
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): ConnectionStatus {
    return webSocketClient.getConnectionStatus()
  }

  /**
   * 获取重试信息
   */
  getRetryInfo(): RetryInfo {
    return webSocketClient.getRetryInfo()
  }

  /**
   * 设置状态变更回调
   */
  setStatusChangeCallback(callback: (retryInfo: RetryInfo) => void): void {
    webSocketClient.setStatusChangeCallback(callback)
  }

  /**
   * 重新连接
   */
  async reconnect(): Promise<void> {
    console.log('🔄 [ChatService] reconnect() 开始...')
    console.log('🔧 [ChatService] 重置初始化状态')
    this.isInitialized = false
    
    try {
      console.log('🔗 [ChatService] 调用 webSocketClient.reset()')
      await webSocketClient.reset()
      this.isInitialized = true
      console.log('🎉 [ChatService] 重连成功')
    } catch (error) {
      console.error('❌ [ChatService] 重连失败:', error)
      this.isInitialized = false  // 失败时确保标志为false
      throw error
    }
  }

  /**
   * 获取聊天列表
   * @param lastId 上次查询的最后一个聊天ID，用于分页
   * @param pageSize 每页大小，默认20
   */
  async getChatList(lastId?: string, pageSize?: number): Promise<Slices<ChatInfoDTO>> {
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
      console.error('[ChatService] 获取聊天消息失败:', error)
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
      console.error('[ChatService] 获取群聊列表失败:', error)
      throw error
    }
  }

  /**
   * 标记消息为已读
   * @param request 标记已读请求参数
   */
  async markMessagesAsRead(request: MessageReadRequest): Promise<void> {
    try {
      const response = await http.patch<ApiResponse<void>>('/chats/read', request)
      
      if (response.data.success === false) {
        throw new Error(response.data.msg || '标记消息已读失败')
      }
      
      console.log(`[ChatService] 标记聊天 ${request.chatId} 的消息已读成功`)
    } catch (error) {
      console.error('[ChatService] 标记消息已读失败:', error)
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
      messageType: request.messageType || 'TEXT',
      clientMsgId: request.clientMsgId // 确保传递客户端消息ID
    }

    webSocketClient.sendMessage(message)
  }

  /**
   * 订阅群聊
   */
  subscribeToGroupChat(chatId: string): void {
    webSocketClient.subscribeToGroupChat(chatId)
  }

  /**
   * 取消订阅群聊
   */
  unsubscribeFromGroupChat(chatId: string): void {
    webSocketClient.unsubscribeFromGroupChat(chatId)
  }

  /**
   * 解散聊天室
   * @param chatId 聊天室ID
   */
  async deleteChat(chatId: string): Promise<void> {
    try {
      const response = await http.delete<ApiResponse<void>>(`/chats/${chatId}`)
      
      if (response.data.success !== false) {
        console.log('解散聊天室成功:', chatId)
        // 取消订阅该聊天室的消息
        this.unsubscribeFromGroupChat(chatId)
      } else {
        throw new Error(response.data.msg || '解散聊天室失败')
      }
    } catch (error) {
      console.error('[ChatService] 解散聊天室失败:', error)
      throw error
    }
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
   * 添加MessageDTO处理器
   */
  addMessageDTOHandler(handler: MessageDTOHandler): void {
    webSocketClient.addMessageDTOHandler(handler)
  }

  /**
   * 移除MessageDTO处理器
   */
  removeMessageDTOHandler(handler: MessageDTOHandler): void {
    webSocketClient.removeMessageDTOHandler(handler)
  }

  /**
   * 添加回执处理器
   */
  addReceiptHandler(handler: (receipt: import('../utils/websocket').MessageReceipt) => void): void {
    webSocketClient.addReceiptHandler(handler)
  }

  /**
   * 移除回执处理器
   */
  removeReceiptHandler(handler: (receipt: import('../utils/websocket').MessageReceipt) => void): void {
    webSocketClient.removeReceiptHandler(handler)
  }

  /**
   * 创建群聊
   */
  async createGroupChat(request: CreateGroupChatRequest): Promise<ChatDTO> {
    try {
      const response = await http.post<ApiResponse<ChatDTO>>('/chats', request)
      
      if (response.data.success !== false && response.data.data) {
        console.log('[ChatService] 创建群聊成功:', response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.msg || '创建群聊失败')
      }
    } catch (error) {
      console.error('[ChatService] 创建群聊失败:', error)
      throw error
    }
  }
}

// 创建全局聊天服务实例
export const chatService = new ChatService()

// 导出默认实例
export default chatService 