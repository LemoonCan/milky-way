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
}

// 导出服务实例  
export const userService = new UserService()

// 导出服务类
export default UserService 