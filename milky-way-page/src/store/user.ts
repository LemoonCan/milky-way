import { create } from 'zustand'
import { userService } from '../services/user'
import type { User } from '../types/api'

interface UserStore {
  // 状态
  currentUser: User | null
  loading: boolean
  error: string | null
  lastFetchTime: number | null

  // 方法
  fetchUserInfo: (force?: boolean) => Promise<void>
  updateUserInfo: (userData: Partial<User>) => void
  clearUser: () => void
  clearError: () => void
}

// 缓存时间（5分钟）
const CACHE_DURATION = 5 * 60 * 1000

export const useUserStore = create<UserStore>()((set, get) => ({
  // 初始状态
  currentUser: null,
  loading: false,
  error: null,
  lastFetchTime: null,

  // 获取用户信息（带缓存）
  fetchUserInfo: async (force = false) => {
    const state = get()
    const now = Date.now()
    
    // 如果有缓存且未过期，不重复请求
    if (!force && state.currentUser && state.lastFetchTime && 
        (now - state.lastFetchTime) < CACHE_DURATION) {
      return
    }

    // 如果正在加载中，避免重复请求
    if (state.loading) {
      return
    }

    set({ loading: true, error: null })

    try {
      const response = await userService.getUserInfo()
      
      if (response.success && response.data) {
        set({
          currentUser: response.data,
          loading: false,
          error: null,
          lastFetchTime: now
        })
      } else {
        // 静默处理错误，不在控制台显示
        set({
          loading: false,
          error: response.msg || '获取用户信息失败'
        })
      }
    } catch (error) {
      // 在开发环境中，API 可能不可用，静默处理错误
      const errorMessage = error instanceof Error ? error.message : '获取用户信息失败'
      console.debug('用户信息获取失败 (这在开发环境中是正常的):', errorMessage)
      
      set({
        loading: false,
        error: errorMessage
      })
    }
  },

  // 更新用户信息（本地更新）
  updateUserInfo: (userData: Partial<User>) => {
    const state = get()
    if (state.currentUser) {
      set({
        currentUser: { ...state.currentUser, ...userData },
        lastFetchTime: Date.now() // 更新缓存时间
      })
    }
  },

  // 清除用户信息
  clearUser: () => {
    set({
      currentUser: null,
      loading: false,
      error: null,
      lastFetchTime: null
    })
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  }
})) 