import { create } from 'zustand'
import { userService } from '../services/user'
import type { User } from '../services/user'

interface UserStore {
  // 状态
  currentUser: User | null
  loading: boolean
  lastFetchTime: number | null

  // 方法
  fetchUserInfo: (force?: boolean) => Promise<void>
  updateUserInfo: (userData: Partial<User>) => void
  clearUser: () => void
}

// 缓存时间（5分钟）
const CACHE_DURATION = 5 * 60 * 1000

export const useUserStore = create<UserStore>()((set, get) => ({
  // 初始状态
  currentUser: null,
  loading: false,
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

    set({ loading: true })

    try {
      const response = await userService.getUserInfo()
      
      if (response.success && response.data) {
        set({
          currentUser: response.data,
          loading: false,
          lastFetchTime: now
        })
      }
    } finally {   
      set({
        loading: false
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
      lastFetchTime: null
    })
  },
})) 