import { create } from 'zustand'
import type { RegisterFormData } from '../components/RegisterPage'

export interface User {
  id: string
  username: string
  nickname: string
  avatar?: string
}

export interface AuthStore {
  isAuthenticated: boolean
  currentUser: User | null
  users: User[] // 模拟用户数据库
  login: (username: string, password: string) => Promise<boolean>
  register: (formData: RegisterFormData) => Promise<boolean>
  logout: () => void
  getCurrentUser: () => User | null
}

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 'user-demo',
    username: 'demo',
    nickname: '演示用户',
    avatar: ''
  }
]

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  users: mockUsers,

  login: async (username: string, password: string) => {
    // 模拟登录验证
    // await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟

    // 简单的模拟验证逻辑
    const user = get().users.find(u => u.username === username)
    
    if (user && (password === '123456' || password === 'password')) {
      set({
        isAuthenticated: true,
        currentUser: user
      })
      console.log('登录成功:', user)
      return true
    }

    console.log('登录失败: 用户名或密码错误')
    return false
  },

  register: async (formData: RegisterFormData) => {
    // 模拟注册过程
    // await new Promise(resolve => setTimeout(resolve, 800)) // 模拟网络延迟

    const existingUser = get().users.find(u => u.username === formData.username)
    
    if (existingUser) {
      console.log('注册失败: 用户名已存在')
      return false
    }

    // 创建新用户
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: formData.username,
      nickname: formData.nickname,
      avatar: formData.avatar || ''
    }

    set(state => ({
      users: [...state.users, newUser]
    }))

    console.log('注册成功:', newUser)
    return true
  },

  logout: () => {
    set({
      isAuthenticated: false,
      currentUser: null
    })
    console.log('用户已退出登录')
  },

  getCurrentUser: () => {
    return get().currentUser
  }
})) 