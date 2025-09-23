import { AxiosError } from 'axios'
import type { ErrorResponse, ApiResponse } from '../types/api'

// 错误类型枚举
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BUSINESS_ERROR = 'BUSINESS_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType
  message: string
  code?: number
  details?: string
}

// 错误处理类
export class ErrorHandler {
  /**
   * 处理API错误
   */
  static handleApiError(error: unknown): ErrorInfo {
    if (error instanceof AxiosError) {
      return this.handleAxiosError(error)
    }
    
    // 处理其他类型的错误
    return {
      type: ErrorType.UNKNOWN_ERROR,
      message: error instanceof Error ? error.message : '未知错误'
    }
  }

  /**
   * 处理API响应中success=false的情况
   */
  static handleApiResponseError(responseData: ApiResponse): ErrorInfo {
    return {
      type: ErrorType.BUSINESS_ERROR, // 使用BUSINESS_ERROR类型表示业务逻辑错误
      message: responseData?.msg || '操作失败',
      code: responseData?.code
    }
  }

  /**
   * 处理Axios错误
   */
  private static handleAxiosError(error: AxiosError<ErrorResponse>): ErrorInfo {
    const { response, code } = error

    // 网络错误
    if (!response) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: this.getNetworkErrorMessage(code)
      }
    }

    const { status, data } = response

    // 根据HTTP状态码分类错误
    switch (status) {
      case 400:
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: data?.message || '请求参数错误',
          code: status,
          details: data?.message
        }

      case 401:
        return {
          type: ErrorType.AUTHENTICATION_ERROR,
          message: data?.message || '身份验证失败，请重新登录',
          code: status
        }

      case 403:
        return {
          type: ErrorType.AUTHORIZATION_ERROR,
          message: data?.message || '没有权限访问此资源',
          code: status
        }

      case 404:
        return {
          type: ErrorType.VALIDATION_ERROR,
          message: data?.message || '请求的资源不存在',
          code: status
        }

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER_ERROR,
          message: data?.message || '服务器错误，请稍后重试',
          code: status
        }

      default:
        return {
          type: ErrorType.UNKNOWN_ERROR,
          message: data?.message || `请求失败 (${status})`,
          code: status
        }
    }
  }

  /**
   * 获取网络错误信息
   */
  private static getNetworkErrorMessage(code?: string): string {
    switch (code) {
      case 'ECONNABORTED':
        return '请求超时，请检查网络连接'
      case 'ENOTFOUND':
        return '网络连接失败，请检查网络设置'
      case 'ECONNREFUSED':
        return '无法连接到服务器'
      default:
        return '网络错误'
    }
  }

  /**
   * 获取用户友好的错误消息
   */
  static getUserFriendlyMessage(error: ErrorInfo): string {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return error.message
      case ErrorType.AUTHENTICATION_ERROR:
        return '登录已过期，请重新登录'
      case ErrorType.AUTHORIZATION_ERROR:
        return '权限不足，无法执行此操作'
      case ErrorType.VALIDATION_ERROR:
        return error.message
      case ErrorType.BUSINESS_ERROR:
        return error.message // 业务错误直接显示原始消息
      case ErrorType.SERVER_ERROR:
        return '服务器繁忙，请稍后再试'
      default:
        return error.message || '操作失败，请稍后重试'
    }
  }
}

// 便捷函数
export const handleError = (error: unknown): ErrorInfo => {
  return ErrorHandler.handleApiError(error)
}

export const getErrorMessage = (error: unknown): string => {
  const errorInfo = handleError(error)
  return ErrorHandler.getUserFriendlyMessage(errorInfo)
} 