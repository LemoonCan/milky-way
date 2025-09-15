import http from '../lib/http'
import type { ApiResponse, Slices } from '../types/api'
import type { SimpleUserDTO } from './user'
import type { User } from './user'

// 好友申请类型
export interface FriendApplication {
  id: string
  fromUser: SimpleUserDTO
  toUser: SimpleUserDTO
  applyMsg?: string
  applyChannel?: string // 申请来源渠道
  status: 'APPLYING' | 'ACCEPTED' | 'REJECTED'
  createTime?: string
  updateTime?: string
}

// 好友申请DTO
export interface FriendApplicationDTO {
  id: string
  fromUser: SimpleUserDTO
  toUser: SimpleUserDTO
  applyChannel?: string
  applyMsg?: string
  status: 'APPLYING' | 'ACCEPTED' | 'REJECTED'
  createTime: string
}

// 好友关系类型 (API返回的嵌套结构)
export interface Friend {
  friend: SimpleUserDTO
  remark?: string
  status: 'ESTABLISHED' | 'BLACKLISTED'
  permission?: string | null
}

// 好友操作参数
export interface FriendOperateRequest {
  friendUserId: string
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

// 好友服务类
class FriendService {
  /**
   * 获取好友列表
   */
  async getFriends(params: FriendsQueryParams): Promise<ApiResponse<Slices<Friend>>> {
    const response = await http.get<ApiResponse<Slices<Friend>>>('/friends', { params })
    return response.data
  }

  /**
   * 获取好友申请列表
   */
  async getFriendApplications(params: FriendApplicationsQueryParams): Promise<ApiResponse<Slices<FriendApplication>>> {
    const response = await http.get<ApiResponse<Slices<FriendApplication>>>('/friends/applications', { params })
    return response.data
  }

  /**
   * 添加好友
   */
  async addFriend(data: AddFriendRequest): Promise<ApiResponse<void>> {
    const response = await http.post<ApiResponse<void>>('/friends/applications/add', data)
    return response.data
  }

  /**
   * 处理好友申请
   */
  async handleFriendApplication(data: HandleFriendApplicationRequest): Promise<ApiResponse<void>> {
    const response = await http.post<ApiResponse<void>>('/friends/applications/handle', data)
    return response.data
  }

  /**
   * 删除好友
   */
  async deleteFriend(friendUserId: string): Promise<ApiResponse<void>> {
    const response = await http.delete<ApiResponse<void>>(`/friends?friendUserId=${friendUserId}`)
    return response.data
  }

  /**
   * 拉黑好友
   */
  async blockFriend(friendUserId: string): Promise<ApiResponse<void>> {
    const response = await http.patch<ApiResponse<void>>(`/friends/block?friendUserId=${friendUserId}`)
    return response.data
  }

  /**
   * 解除拉黑
   */
  async unblockFriend(friendUserId: string): Promise<ApiResponse<void>> {
    const response = await http.patch<ApiResponse<void>>(`/friends/unblock?friendUserId=${friendUserId}`)
    return response.data
  }

  /**
   * 通过OpenID搜索用户
   */
  async searchUserByOpenId(openId: string): Promise<ApiResponse<User>> {
    const response = await http.post<ApiResponse<User>>(`/users/matchByOpenId?openId=${openId}`)
    return response.data
  }

  /**
   * 通过手机号搜索用户
   */
  async searchUserByPhone(phone: string): Promise<ApiResponse<User>> {
    const response = await http.post<ApiResponse<User>>(`/users/matchByPhone?phone=${phone}`)
    return response.data
  }

  /**
   * 获取好友总数
   */
  async countFriends(): Promise<ApiResponse<number>> {
    const response = await http.get<ApiResponse<number>>('/friends/count')
    return response.data
  }

  /**
   * 获取好友申请数量
   */
  async countApplications(): Promise<ApiResponse<number>> {
    const response = await http.get<ApiResponse<number>>('/friends/applications/count')
    return response.data
  }
}

// 导出服务实例
export const friendService = new FriendService()

// 导出服务类
export default FriendService 