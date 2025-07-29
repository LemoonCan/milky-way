import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/auth'
import { tokenManager } from '../lib/http'
import { getErrorMessage } from '../lib/error-handler'
import { handleAndShowError } from '../lib/globalErrorHandler'
import { useUserStore } from './user'
import type { RegisterFormData } from '../components/auth/RegisterPage'
import { useConnectionManagerStore } from './connectionManager'

export interface AuthStore {
  // 状态
  isAuthenticated: boolean
  loading: boolean
  
  // 方法
  login: (openId: string, password: string) => Promise<boolean>
  register: (formData: RegisterFormData) => Promise<boolean>
  logout: () => Promise<void>
  checkAuthStatus: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      isAuthenticated: tokenManager.isAuthenticated(),
      loading: false,

      // 登录方法
      login: async (openId: string, password: string) => {
        const currentState = get()
        
        // 如果正在登录中，避免重复请求
        if (currentState.loading) {
          console.warn('登录请求正在进行中，忽略重复请求')
          return false
        }

        set({ loading: true})
        
        try {
          const result = await authService.loginByOpenId({ openId, password })
          
          if (result.success !== false) {
            set({
              isAuthenticated: true,
              loading: false
            })
            
            return true
          } else {
            throw new Error(result.msg || '登录失败')
          }
        } catch (error) {
          // 使用全局错误处理
          handleAndShowError(error)
          set({
            isAuthenticated: false,
            loading: false
          })
          return false
        }
      },

      // 注册方法
      register: async (formData: RegisterFormData) => {
        set({ loading: true })
        
        try {
          const registerData = {
            openId: formData.username, // 使用username作为openId
            password: formData.password,
            nickName: formData.nickName
          }
          
          const result = await authService.register(registerData)
          
          if (result.success !== false) {
            set({
              loading: false
            })
            console.log('注册成功')
            return true
          } else {
            throw new Error(result.msg || '注册失败')
          }
        } catch (error) {
          // 使用全局错误处理
          handleAndShowError(error)
          set({
            loading: false
          })
          return false
        }
      },

      // 登出方法
      logout: async () => {
        set({ loading: true })
        
        try {
          await authService.logout()
        } catch (error) {
          console.error('登出请求失败:', getErrorMessage(error))
        } finally {
          // 无论服务端登出是否成功，都清除本地状态
          tokenManager.removeToken()
          
          // 清除用户信息缓存
          const userStore = useUserStore.getState()
          userStore.clearUser()
          
          // 断开WebSocket连接
          try {
            useConnectionManagerStore.getState().destroy()
            console.log('WebSocket连接已断开')
          } catch (error) {
            console.error('断开WebSocket连接失败:', error)
          }
          
          set({
            isAuthenticated: false,
            loading: false,
          })
          console.log('用户已退出登录')
        }
      },

      // 检查认证状态
      checkAuthStatus: () => {
        const isAuth = tokenManager.isAuthenticated()
        const currentState = get()
        
        // 如果token存在但状态不一致，需要更新状态
        if (isAuth !== currentState.isAuthenticated) {
          set({ isAuthenticated: isAuth })
        }
        
        // 如果没有token，清除用户信息
        if (!isAuth) {
          set({ 
            isAuthenticated: false,
          })
        }
      }
    }),
    {
      name: 'milky-way-auth', // 持久化存储的key
      partialize: (state) => ({
        // 只持久化必要的状态，不持久化loading和error
        isAuthenticated: state.isAuthenticated
      })
    }
  )
) 