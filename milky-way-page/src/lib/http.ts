import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, ErrorResponse } from '../types/api'
import EnvConfig from './env'

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
    
    return response
  },
  (error: AxiosError<ErrorResponse>) => {
    // 处理错误响应
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地token并跳转到登录页
      tokenManager.removeToken()
      // 可以在这里触发全局事件或路由跳转
      console.warn('认证失效，请重新登录')
    }
    
    // 统一错误处理
    const errorMessage = error.response?.data?.message || error.message || '网络请求失败'
    console.error('API请求错误:', errorMessage)
    
    return Promise.reject(error)
  }
)

// 导出环境配置供其他模块使用
export { EnvConfig }
export default http 