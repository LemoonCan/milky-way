import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, ErrorResponse } from '../types/api'
import EnvConfig from './env'
import { handleAndShowError, handleAndShowApiResponseError } from './globalErrorHandler'
import { AuthHandler } from './auth-handler'

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: EnvConfig.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 开发环境下打印配置信息
if (EnvConfig.IS_DEVELOPMENT) {
  console.log('🌐 HTTP配置:', {
    baseURL: EnvConfig.API_BASE_URL,
    wsURL: EnvConfig.WS_URL,
    nodeEnv: EnvConfig.NODE_ENV,
  })
}

// Token管理
const TOKEN_KEY = 'milky_way_token'

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY)
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken()
  }
}

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken()
    if (token) {
      // 根据后端的HttpHeaderToken设置，添加Bearer前缀
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 处理成功响应
    
    // 检查token是否在响应头中（登录时后端会返回token在header中）
    const tokenHeader = response.headers['authorization']
    if (tokenHeader && tokenHeader.startsWith('Bearer ')) {
      const token = tokenHeader.replace('Bearer ', '')
      tokenManager.setToken(token)
    }
    
    // 检查响应体中的success字段
    if (response.data && response.data.success === false) {
      // 使用全局错误处理显示错误
      handleAndShowApiResponseError(response.data)
      // 创建一个错误对象并抛出，这样调用方可以在catch中处理
      const error = new Error(response.data.msg || '操作失败')
      return Promise.reject(error)
    }
    
    return response
  },
  (error: AxiosError<ErrorResponse | ApiResponse>) => {
    // 处理错误响应
    const status = error.response?.status
    const responseData = error.response?.data
    
    // 处理401和403状态码
    if (status === 401 || status === 403) {
      const defaultMessage = status === 401 ? '认证失败' : '权限不足'
      const errorMessage = AuthHandler.extractErrorMessage(responseData, defaultMessage)
      
      // 使用认证处理器处理认证失败，传递状态码
      AuthHandler.handleAuthFailure(errorMessage)
    } else {
      // 其他HTTP错误，使用全局错误处理
      handleAndShowError(error)
    }
    
    return Promise.reject(error)
  }
)

// 导出环境配置供其他模块使用
export { EnvConfig }
export default http 