import { showGlobalError } from '../store/globalError'
import { getErrorMessage } from './error-handler'

/**
 * 全局错误处理工具函数集合
 */

/**
 * 处理并显示 API 错误
 * @param error 错误对象
 * @param options 显示选项
 */
export const handleAndShowError = (
  error: unknown,
  options?: {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
    autoClose?: boolean
    autoCloseDelay?: number
  }
) => {
  const errorMessage = getErrorMessage(error)
  showGlobalError(errorMessage, options)
}

/**
 * 显示简单的错误消息
 * @param message 错误消息
 * @param options 显示选项
 */
export const showError = (
  message: string,
  options?: {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
    autoClose?: boolean
    autoCloseDelay?: number
  }
) => {
  showGlobalError(message, options)
}

/**
 * 显示网络错误
 */
export const showNetworkError = () => {
  showGlobalError('网络连接失败，请检查网络设置', {
    autoCloseDelay: 5000
  })
}

/**
 * 显示权限错误
 */
export const showPermissionError = () => {
  showGlobalError('权限不足，无法执行此操作', {
    autoCloseDelay: 4000
  })
}

/**
 * 显示服务器错误
 */
export const showServerError = () => {
  showGlobalError('服务器繁忙，请稍后重试', {
    autoCloseDelay: 4000
  })
}

/**
 * 批量错误处理（用于表单验证等场景）
 * @param errors 错误数组
 * @param options 显示选项
 */
export const showMultipleErrors = (
  errors: string[],
  options?: {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
    autoClose?: boolean
    autoCloseDelay?: number
    delay?: number // 多个错误之间的延迟
  }
) => {
  const delay = options?.delay || 500
  
  errors.forEach((error, index) => {
    setTimeout(() => {
      showGlobalError(error, {
        position: options?.position,
        autoClose: options?.autoClose,
        autoCloseDelay: options?.autoCloseDelay
      })
    }, index * delay)
  })
}

// 导出常用的错误类型，方便其他模块使用
export { showGlobalError, clearGlobalErrors } from '../store/globalError' 