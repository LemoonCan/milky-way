import http from '../lib/http'
import type { 
  RegisterRequest, 
  LoginByOpenIdRequest, 
  LoginByPhoneRequest, 
  ChangePasswordRequest,
  ApiResponse,
  User 
} from '../types/api'

// 认证服务类
class AuthService {
  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<ApiResponse<void>> {
    const response = await http.post<ApiResponse<void>>('/auth/register', data)
    return response.data
  }

  /**
   * 账号登录
   */
  async loginByOpenId(data: LoginByOpenIdRequest): Promise<ApiResponse<void>> {
    const response = await http.patch<ApiResponse<void>>('/auth/loginByOpenId', data)
    return response.data
  }

  /**
   * 手机号登录
   */
  async loginByPhone(data: LoginByPhoneRequest): Promise<ApiResponse<void>> {
    const response = await http.patch<ApiResponse<void>>('/auth/loginByPhone', data)
    return response.data
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    const response = await http.patch<ApiResponse<void>>('/auth/changePassword', data)
    return response.data
  }

  /**
   * 登出
   */
  async logout(): Promise<ApiResponse<void>> {
    const response = await http.patch<ApiResponse<void>>('/auth/logout')
    return response.data
  }

  /**
   * 获取当前用户信息（如果后端有此接口）
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await http.get<ApiResponse<User>>('/user/profile')
    return response.data
  }
}

// 导出服务实例
export const authService = new AuthService()

// 导出服务类
export default AuthService 