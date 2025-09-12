import type { MessageDTO } from '../services/chat'
import type { SimpleUserDTO } from '../services/user'

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




// 聊天消息查询参数
export interface ChatMessagesQueryParam {
  chatId: string
  before?: string  // 分页游标，查询在此ID之前的消息
  after?: string   // 分页游标，查询在此ID之后的消息
  pageSize: number
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

// 朋友圈相关类型

// 朋友圈动态内容类型
export enum MomentContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  TEXT_IMAGE = 'TEXT_IMAGE'
}

// 朋友圈动态描述DTO
export interface MomentDescriptionDTO {
  id: string
  contentType: MomentContentType
  text?: string
  medias?: string[]
}

// 朋友圈动态DTO - 根据实际后端返回数据结构调整
export interface MomentDTO {
  id: string
  user: SimpleUserDTO
  contentType?: MomentContentType
  text?: string
  medias?: string[]
  location?: string
  likeCounts?: number // 可选：不再在前端使用显示
  commentCounts?: number // 可选：不再在前端使用显示
  createTime: string | null  // 修正字段名，匹配后端返回数据
  likeUsers?: SimpleUserDTO[]
  comments?: CommentDTO[]
}

// 评论DTO - 根据实际后端返回数据结构调整
export interface CommentDTO {
  id: number
  momentId?: string  // 添加 momentId 字段（用于通知）
  parentCommentId?: number | null
  user: SimpleUserDTO
  content: string
  createTime: string | null  // 允许null值
  replyUser?: SimpleUserDTO
  replies?: CommentDTO[]
}

// 新增：带动态信息的评论DTO（用于通知）
export interface CommentWithMomentDTO {
  id: number
  momentDescription: MomentDescriptionDTO
  parentCommentId?: number | null
  user: SimpleUserDTO
  content: string
  createTime: string
  replyUser?: SimpleUserDTO
}

// 发布动态参数 - 根据后端PublishParam调整
export interface PublishParam {
  text?: string
  contentType: MomentContentType
  medias?: string[]
  location?: string
  publishUserId?: string
}

// 评论参数
export interface CommentParam {
  momentId: string
  content: string
  parentCommentId?: string
  commentUserId?: string
}

// 朋友圈动态查询参数
export interface MomentsQueryParams {
  lastId?: string
  pageSize: number
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

// 群聊信息DTO
export interface ChatInfoDTO {
  id: string
  chatType: 'SINGLE' | 'GROUP'
  title: string
  avatar: string
  lastMessageId?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
  minUnreadMessageId?: string
  online: boolean
}


// 点赞DTO - 更新结构
export interface LikeDTO {
  momentDescription: MomentDescriptionDTO
  user: SimpleUserDTO
  createTime: string
}

// 取消点赞DTO
export interface UnlikeDTO {
  momentId: string
  userId: string
  publishUserId: string
}

// 通知项类型
export interface NotificationItem {
  id: string
  type: MessageNotifyType
  content: unknown
  timestamp: string
  read: boolean
  title: string
  message: string
  avatar?: string
}

// 通知统计
export interface NotificationStats {
  total: number
  unread: number
  likeCount: number
  commentCount: number
} 