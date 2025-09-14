import { create } from 'zustand'

export interface GlobalError {
  id: string
  message: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
  autoClose?: boolean
  autoCloseDelay?: number
  timestamp: number
}

interface GlobalErrorStore {
  errors: GlobalError[]
  
  // 显示错误
  showError: (
    message: string, 
    options?: {
      position?: GlobalError['position']
      autoClose?: boolean
      autoCloseDelay?: number
    }
  ) => void
  
  // 移除错误
  removeError: (id: string) => void
  
  // 清除所有错误
  clearAllErrors: () => void
  
  // 移除过期的错误
  removeExpiredErrors: () => void
}

// 生成唯一ID
const generateId = () => `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const useGlobalErrorStore = create<GlobalErrorStore>((set, get) => ({
  errors: [],
  
  showError: (message, options = {}) => {
    if (get().errors.some(error => error.message === message)) {
      return
    }

    const newError: GlobalError = {
      id: generateId(),
      message,
      position: options.position || 'top-right',
      autoClose: options.autoClose !== false, // 默认自动关闭
      autoCloseDelay: options.autoCloseDelay || 3000,
      timestamp: Date.now()
    }
    
    set(state => ({
      errors: [...state.errors, newError]
    }))
    
    // 如果设置了自动关闭，设置定时器
    if (newError.autoClose) {
      setTimeout(() => {
        get().removeError(newError.id)
      }, newError.autoCloseDelay)
    }
  },
  
  removeError: (id) => {
    set(state => ({
      errors: state.errors.filter(error => error.id !== id)
    }))
  },
  
  clearAllErrors: () => {
    set({ errors: [] })
  },
  
  removeExpiredErrors: () => {
    const now = Date.now()
    set(state => ({
      errors: state.errors.filter(error => {
        // 移除超过10秒的错误（防止内存泄漏）
        return (now - error.timestamp) < 10000
      })
    }))
  }
}))

// 全局错误显示函数 - 各页面可以直接调用
export const showGlobalError = (
  message: string,
  options?: Parameters<GlobalErrorStore['showError']>[1]
) => {
  useGlobalErrorStore.getState().showError(message, options)
}

// 清除错误的便捷函数
export const clearGlobalErrors = () => {
  useGlobalErrorStore.getState().clearAllErrors()
} 