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
  createdAt?: string
  updatedAt?: string
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
  status: 'ESTABLISHED' | 'BLOCKED'
  permission?: string | null
}

export interface Friend {
  openId: string
  nickName: string
  nickNameFirstLetter: string
  avatar?: string
  remark?: string
  status: 'ESTABLISHED' | 'BLOCKED'
  permission?: string | null
}

export interface FriendApplication {
  id: string
  fromUserId: string
  toUserId: string
  fromUserNickName: string
  fromUserAvatar?: string
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
}

// 好友列表分页响应 - 基于实际API响应
export interface FriendListData {
  data: FriendRelation[]
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

// 添加好友参数
export interface AddFriendRequest {
  toUserId: string
  applyMessage: string
  extraInfo?: {
    remark?: string
    permission?: 'ALL' | 'CHAT'
  }
}

// 处理好友申请参数
export interface HandleFriendApplicationRequest {
  applicationId: string
  action: 'accept' | 'reject'
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