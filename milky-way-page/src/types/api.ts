// API 基础响应类型
export interface ApiResponse<T = unknown> {
  code?: number
  msg?: string
  data?: T
  success?: boolean
}

// 认证相关类型
export interface User {
  id: string
  openId: string
  nickName: string
  phone?: string
  avatar?: string
  individualSignature?: string // 个性签名
  createTime?: string
  updateTime?: string
}

// 注册参数
export interface RegisterRequest {
  openId: string
  password: string
  nickName: string
  phone?: string
  avatar?: string
}

// 登录参数（账号登录）
export interface LoginByOpenIdRequest {
  openId: string
  password: string
}

// 手机号登录参数
export interface LoginByPhoneRequest {
  phone: string
  verificationCode: string
}

// 修改密码参数
export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// 认证相关响应
export interface AuthResponse {
  token?: string
  user?: User
}

// 错误响应
export interface ErrorResponse {
  code: number
  message: string
  timestamp?: string
  path?: string
}

// 好友相关类型 - 基于实际API响应
export interface FriendInfo {
  id: string
  openId: string
  nickName: string
  nickNameFirstLetter: string
  avatar?: string
}

export interface FriendRelation {
  friend: FriendInfo
  remark?: string
  status: 'ESTABLISHED' | 'BLACKLISTED'
  permission?: string | null
}

export interface Friend {
  id: string
  openId: string
  nickName: string
  nickNameFirstLetter: string
  avatar?: string
  remark?: string
  status: 'ESTABLISHED' | 'BLACKLISTED' | 'BLACKLISTED_BY'
  permission?: string | null
}

// 好友申请用户信息
export interface FriendApplicationUser {
  id: string
  openId?: string | null
  nickName: string
  nickNameFirstLetter?: string | null
  avatar?: string
}

// 好友申请 - 根据实际API响应更新
export interface FriendApplication {
  id: string
  fromUser: FriendApplicationUser
  toUser: FriendApplicationUser
  applyMsg?: string
  applyChannel?: string // 申请来源渠道
  status: 'APPLYING' | 'ACCEPTED' | 'REJECTED'
  createTime?: string
  updateTime?: string
}

// 好友列表分页响应 - 基于实际API响应
export interface FriendListData {
  items: FriendRelation[]
  hasNext: boolean
  size: number
}

// 好友申请列表分页响应
export interface FriendApplicationListData {
  items: FriendApplication[]
  hasNext: boolean
  size: number
}

export interface FriendSlices {
  content: Friend[]
  hasNext: boolean
  nextPageInfo?: {
    lastLetter: string
    lastNickName: string
  }
}

// 好友列表查询参数
export interface FriendsQueryParams {
  lastLetter?: string
  lastNickName?: string
  pageSize: number
}

// 好友申请查询参数
export interface FriendApplicationsQueryParams {
  lastId?: string
  pageSize: number
}

// 添加好友参数
export interface AddFriendRequest {
  toUserId: string
  applyMessage: string
  applyChannel?: string // 申请来源渠道
  extraInfo?: {
    remark?: string
    permission?: 'ALL' | 'CHAT'
  }
}

// 处理好友申请参数
export interface HandleFriendApplicationRequest {
  friendApplicationId: string
  status: 'ACCEPTED' | 'REJECTED'
  extraInfo?: {
    remark?: string
    permission?: 'ALL' | 'CHAT'
  }
}

// 好友操作参数
export interface FriendOperateRequest {
  friendUserId: string
}

// 用户搜索参数
export interface UserSearchRequest {
  openId?: string
  phone?: string
}

// 聊天消息相关类型
export interface MessageDTO {
  id: string
  clientMsgId?: string // 客户端消息ID，用于回执匹配
  chatId: string
  sender: SimpleUserDTO
  type: 'SYSTEM' | 'TEXT' | 'IMAGE' | 'FILE'
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
  creatTime: string
  likeUsers?: SimpleUserDTO[]
  comments?: CommentDTO[]
}

// 点赞内容DTO
export interface LikeContentDTO {
  id: string
  likeUserId: string
  likeUser: SimpleUserDTO
  createTime: string
}

// 评论内容DTO
export interface CommentContentDTO {
  id: string
  commentUserId: string
  commentUser: SimpleUserDTO
  content: string
  parentCommentId?: string
  parentCommentUser?: SimpleUserDTO
  createTime: string
}

// 评论DTO - 根据实际后端返回数据结构调整
export interface CommentDTO {
  id: number
  parentCommentId?: number | null
  user: SimpleUserDTO
  content: string
  createTime: string
  replyUser?: SimpleUserDTO
  replies?: CommentDTO[]
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