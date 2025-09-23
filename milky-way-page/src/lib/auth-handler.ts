import { tokenManager } from './http'
import { handleAndShowError } from './globalErrorHandler'

/**
 * 认证处理工具函数
 */
export class AuthHandler {
  /**
   * 处理认证失败，显示弹窗并跳转到登录页
   * @param message 错误消息
   */
  static handleAuthFailure(message: string = '认证失败') {
    // 检查本地是否有token，如果没有token则不需要处理
    if (!tokenManager.isAuthenticated()) {
      handleAndShowError(new Error(message))
      return
    }
    
    console.log('[AuthHandler] 检测到认证失败，本地有token，跳转到认证失败页面')
    
    // 跳转到认证失败页面，将错误消息作为URL参数传递
    const encodedMessage = encodeURIComponent(message)
    window.location.href = `/auth-failure?message=${encodedMessage}`
  }
  
  
  /**
   * 检查响应数据并提取错误消息
   * @param responseData 响应数据
   * @param defaultMessage 默认错误消息
   * @returns 错误消息
   */
  static extractErrorMessage(responseData: unknown, defaultMessage: string = '认证失败'): string {
    if (!responseData || typeof responseData !== 'object') {
      return defaultMessage
    }
    
    const data = responseData as Record<string, unknown>
    
    // 检查是否有msg字段（ApiResponse格式）
    if ('msg' in data && typeof data.msg === 'string' && data.msg) {
      return data.msg
    }
    
    
    
    return defaultMessage
  }
}
