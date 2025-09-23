import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/auth'
import { tokenManager } from '../lib/http'
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
  forceLogout: () => void
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
          } 
          return false
        } finally {
          set({
            loading: false
          })
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
            return true
          } 
          return false
        } finally {
          set({
            loading: false
          })
        }
      },

      // 登出方法
      logout: async () => {
        set({ loading: true })
        
        try {
          await authService.logout()
        } finally {
          // 无论服务端登出是否成功，都清除本地状态
          tokenManager.removeToken()
          
          // 清除用户信息缓存
          const userStore = useUserStore.getState()
          userStore.clearUser()
          
          // 断开WebSocket连接
          useConnectionManagerStore.getState().destroy()          
          
          set({
            isAuthenticated: false,
            loading: false,
          })
        }
      },

      // 强制登出（用于认证失败时）
      forceLogout: () => {
        // 清除本地token
        tokenManager.removeToken()
        
        // 清除用户信息缓存
        const userStore = useUserStore.getState()
        userStore.clearUser()
        
        // 断开WebSocket连接
        useConnectionManagerStore.getState().destroy()
        
        
        // 更新认证状态
        set({
          isAuthenticated: false,
          loading: false,
        })
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