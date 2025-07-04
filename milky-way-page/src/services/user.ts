import http from '../lib/http'
import type { ApiResponse, User } from '../types/api'

// 用户信息更新请求类型
export interface UpdateUserRequest {
  openId: string
  nickName: string
  avatar?: string
  individualSignature?: string // 个性签名
}

// 用户服务类
class UserService {
  // 简单的内存缓存，存储最近请求的用户数据（5分钟有效）
  private userCache = new Map<string, { data: ApiResponse<User>; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5分钟

  /**
   * 获取当前用户信息
   */
  async getUserInfo(): Promise<ApiResponse<User>> {
    const response = await http.get<ApiResponse<User>>('/users/userInfo')
    return response.data
  }

  /**
   * 更新当前用户信息
   */
  async updateUserInfo(data: UpdateUserRequest): Promise<ApiResponse<void>> {
    const response = await http.post<ApiResponse<void>>('/users/userInfo', data)
    return response.data
  }

  /**
   * 通过openId获取用户详细信息（带缓存）
   */
  async getUserByOpenId(openId: string): Promise<ApiResponse<User>> {
    // 检查缓存
    const cached = this.userCache.get(openId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Using cached user data for:', openId)
      return cached.data
    }

    console.log('Fetching user data from API for:', openId)
    const response = await http.post<ApiResponse<User>>(`/users/matchByOpenId?openId=${openId}`)
    const result = response.data

    // 缓存成功的响应
    if (result.success) {
      this.userCache.set(openId, {
        data: result,
        timestamp: Date.now()
      })
    }

    return result
  }

  /**
   * 清除指定用户的缓存
   */
  clearUserCache(openId?: string): void {
    if (openId) {
      this.userCache.delete(openId)
    } else {
      this.userCache.clear()
    }
  }
}

// 导出服务实例  
export const userService = new UserService()

// 导出服务类
export default UserService 