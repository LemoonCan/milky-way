import type { MessageDTO } from '../services/chat'

// API 基础响应类型
export interface ApiResponse<T = unknown> {
  code?: number
  msg?: string
  data?: T
  success?: boolean
}

// 错误响应
export interface ErrorResponse {
  code: number
  message: string
  timestamp?: string
  path?: string
}

// 分页返回类型
export interface Slices<T> {
  items: T[]
  hasNext: boolean
  lastId?: string
  size: number
}

// 消息发送回执类型
export interface MessageReceipt {
  success: boolean
  code: string
  msg: string
  data?: MessageDTO
}

// 通知相关类型定义
export enum MessageNotifyType {
  FRIEND_APPLY = 'FRIEND_APPLY',
  NEW_FRIEND = 'NEW_FRIEND',
  CHAT_CREATE = 'CHAT_CREATE',
  CHAT_DELETE = 'CHAT_DELETE',
  MOMENT_CREATE = 'MOMENT_CREATE',
  MOMENT_DELETE = 'MOMENT_DELETE',
  LIKE = 'LIKE',
  UNLIKE = 'UNLIKE',
  COMMENT = 'COMMENT',
  COMMENT_DELETE = 'COMMENT_DELETE'
}

export interface MessageNotifyDTO<T> {
  notifyType: MessageNotifyType
  content: T
}

