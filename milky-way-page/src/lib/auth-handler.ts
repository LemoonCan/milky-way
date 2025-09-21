import { tokenManager } from './http'

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
      console.log('[AuthHandler] 本地无token，无需处理认证失败')
      return
    }
    
    console.log('[AuthHandler] 检测到认证失败，本地有token，跳转到认证失败页面')
    
    // 跳转到认证失败页面，将错误消息作为URL参数传递
    const encodedMessage = encodeURIComponent(message)
    window.location.href = `/auth-failure?message=${encodedMessage}`
  }
  
  /**
   * 执行登出和跳转操作（公开方法，供备用方案使用）
   */
  static performLogoutAndRedirect() {
    // 使用动态导入来避免循环依赖
    import('../store/auth').then(({ useAuthStore }) => {
      // 调用强制登出方法
      useAuthStore.getState().forceLogout()
    }).catch((error) => {
      console.error('导入认证store失败:', error)
      
      // 备用方案：手动清除
      tokenManager.removeToken()
      this.clearAuthRelatedStorage()
    })
  }
  
  /**
   * 清除认证相关的本地存储
   */
  private static clearAuthRelatedStorage() {
    try {
      // 清除可能的用户信息缓存
      localStorage.removeItem('milky-way-user')
      localStorage.removeItem('milky-way-auth')
      
      // 清除其他可能的认证相关存储
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('milky-way-')) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn('清除本地存储时出错:', error)
    }
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
