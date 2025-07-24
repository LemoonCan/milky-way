import http from '../lib/http'
import { webSocketClient, type WebSocketMessage } from './websocket'
import { handleAndShowError } from '../lib/globalErrorHandler'
import type { ApiResponse, Slices } from '../types/api'

// 重新导出常用类型
export type { Slices } from '../types/api'

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

// 消息元数据类型
export interface MessageMeta {
  type: 'SYSTEM' | 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO'
  content?: string | null
  media?: string | null
  videoUrl?: string | null// 真实视频URL，用于视频消息类型
}

// MessageMeta URL处理工具类
export class MessageMetaHelper {
  /**
   * 根据媒体类型设置真实URL
   * @param meta MessageMeta对象
   * @param realUrl 真实URL
   */
  static setRealUrl(meta: MessageMeta, realUrl: string): void {
    if(meta.type==='FILE'||meta.type==='IMAGE'){
      meta.media = realUrl;
    }else if(meta.type==='VIDEO'){
      meta.videoUrl = realUrl;
    }
  }

  /**
   * 根据媒体类型获取真实URL
   * @param meta MessageMeta对象
   * @returns 真实URL或null
   */
  static getRealUrl(meta: MessageMeta): string | null| undefined {
    if(meta.type==='FILE'||meta.type==='IMAGE'){
      return meta.media;
    }else if(meta.type==='VIDEO'){
      return meta.videoUrl;
    }
    return null;
  }

  static getMessageTypeFromFile = (file: File): "IMAGE" | "VIDEO" | "FILE" => {
    if (file.type.startsWith("image/")) return "IMAGE";
    if (file.type.startsWith("video/")) return "VIDEO";
    return "FILE";
  }
}

// 添加消息DTO类型，对应后端的 MessageDTO
export interface MessageDTO {
  id: string
  clientMsgId?: string // 客户端消息ID，用于回执匹配
  chatId: string
  sender: SimpleUserDTO
  meta: MessageMeta
  sentTime: string
  read?: boolean
  readTime?: string
}

// 文件数据接口
export interface FileData {
  originalFile?: File
}

// 简单用户信息DTO
export interface SimpleUserDTO {
  id: string
  openId: string
  nickName: string
  avatar?: string
}

// 客户端消息类型，包含UI状态字段
export interface ClientMessageDTO extends MessageDTO {
  sendStatus?: 'sending' | 'sent' | 'failed'
  fileData?: FileData
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
    console.log('sendMessage', request)
    
    try {
      if (!webSocketClient.isConnected()) {
        throw new Error('聊天服务未就绪，请先初始化')
      }

      const message: WebSocketMessage = {
        chatId: request.chatId,
        content: request.content,
        messageType: request.messageType || 'TEXT',
        clientMsgId: request.clientMsgId // 确保传递客户端消息ID
      }

      webSocketClient.sendMessage(message)
    } catch (error) {
      // 在服务层统一处理错误
      console.error('[ChatService] 发送消息失败:', error)
      
      // 显示错误给用户
      handleAndShowError(error)
      
      // 重新抛出错误，让调用层知道操作失败
      throw error
    }
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