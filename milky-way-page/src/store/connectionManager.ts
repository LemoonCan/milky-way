import { create } from 'zustand'
import { ConnectionStatus, type RetryInfo } from '../services/websocket'
import { webSocketClient } from '../services/websocket'
import { useMessageManagerStore } from './messageManager'
import { useNotificationManagerStore } from './notificationManager'

/**
 * 连接管理Store - 统一管理WebSocket连接状态和操作
 */
export interface ConnectionManagerStore {
  // 状态数据
  connectionStatus: ConnectionStatus
  connectionError: string | null
  retryInfo: RetryInfo
  isInitialized: boolean

  // 状态查询方法
  isConnected: () => boolean
  isConnecting: () => boolean
  isRetrying: () => boolean
  isFailed: () => boolean
  getConnectionDisplayText: () => string

  // 状态更新方法
  updateConnectionState: (retryInfo: RetryInfo) => void
  setConnectionStatus: (status: ConnectionStatus, error?: string) => void

  // 连接管理方法
  initialize: () => Promise<void>
  destroy: () => void
  reconnect: () => Promise<void>
  resetConnection: () => Promise<void>

  // 私有方法（内部使用）
  _attemptConnection: () => Promise<void>
  _connectWithRetry: () => Promise<void>

  // 初始化聊天服务
  initializeApp: () => Promise<void>
}

// 内部函数：设置WebSocket状态回调
const setupStatusHandler = (get: () => ConnectionManagerStore) => {
  webSocketClient.setStatusChangeHandler((status, error) => {
    console.log('📡 [ConnectionManager] 收到WebSocket状态变更:', { status, error })
    
    const currentState = get()
    
    // 只处理WebSocket能确定的状态，避免与重试逻辑冲突
    if (status === ConnectionStatus.CONNECTED) {
      // 连接成功，重置重试信息
      get().updateConnectionState({
        currentAttempt: 0,
        maxAttempts: currentState.retryInfo.maxAttempts,
        status: ConnectionStatus.CONNECTED,
        error: undefined
      })
    } else if (status === ConnectionStatus.DISCONNECTED) {
      // 连接断开，但不覆盖正在进行的重试状态
      if (currentState.connectionStatus !== ConnectionStatus.RETRYING && 
          currentState.connectionStatus !== ConnectionStatus.CONNECTING) {
        get().updateConnectionState({
          ...currentState.retryInfo,
          status: ConnectionStatus.DISCONNECTED,
          error: error || '连接断开'
        })
      } else {
        console.log('[ConnectionManager] 正在重试中，忽略WebSocket断开状态')
      }
    }
    // 忽略WebSocket的FAILED、CONNECTING、RETRYING状态，这些完全由connectionManager控制
    console.log('[ConnectionManager] 当前状态管理由connectionManager控制:', currentState.connectionStatus)
  })
}

// 重试配置
const RETRY_CONFIG = {
  maxAttempts: 2,
  delays: [3000, 15000] // 3秒, 15秒
}

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const useConnectionManagerStore = create<ConnectionManagerStore>((set, get) => ({
  // 初始状态
  connectionStatus: ConnectionStatus.DISCONNECTED,
  connectionError: null,
  retryInfo: {
    currentAttempt: 0,
    maxAttempts: RETRY_CONFIG.maxAttempts,
    status: ConnectionStatus.DISCONNECTED
  },
  isInitialized: false,

  // 状态查询方法
  isConnected: () => {
    return get().connectionStatus === ConnectionStatus.CONNECTED
  },

  isConnecting: () => {
    return get().connectionStatus === ConnectionStatus.CONNECTING
  },

  isRetrying: () => {
    return get().connectionStatus === ConnectionStatus.RETRYING
  },

  isFailed: () => {
    return get().connectionStatus === ConnectionStatus.FAILED
  },

 

  getConnectionDisplayText: () => {
    const state = get()
    switch (state.connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return '已连接'
      case ConnectionStatus.CONNECTING:
        return '连接中...'
      case ConnectionStatus.RETRYING:
        return `重连中...`
      case ConnectionStatus.FAILED:
        return '连接失败'
      case ConnectionStatus.DISCONNECTED:
        return '未连接'
      default:
        return '未知状态'
    }
  },

  // 状态更新方法
  updateConnectionState: (retryInfo: RetryInfo) => {
    set({
      retryInfo,
      connectionStatus: retryInfo.status,
      connectionError: retryInfo.error || null
    })
  },

  setConnectionStatus: (status: ConnectionStatus, error?: string) => {
    set(state => ({
      connectionStatus: status,
      connectionError: error || null,
      retryInfo: {
        ...state.retryInfo,
        status,
        error
      }
    }))
  },

  // 私有方法：单次连接尝试
  _attemptConnection: async (): Promise<void> => {
    try {
      await webSocketClient.connect()
    } catch (error) {
      const message = error instanceof Error ? error.message : '连接失败'
      throw new Error(message)
    }
  },

  // 私有方法：带重试的连接
  _connectWithRetry: async (): Promise<void> => {
    console.log('🔄 [ConnectionManager] 开始带重试的连接尝试')
    
    // 重置重试状态
    set(state => ({
      retryInfo: {
        ...state.retryInfo,
        currentAttempt: 0,
        error: undefined
      }
    }))

    // 总尝试次数 = 1次初始 + maxAttempts次重试
    const totalAttempts = RETRY_CONFIG.maxAttempts + 1
    
    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      console.log(`[ConnectionManager] 连接尝试 ${attempt + 1}/${totalAttempts}`)
      
      // 更新重试状态
      const status = attempt === 0 ? ConnectionStatus.CONNECTING : ConnectionStatus.RETRYING
      set(state => ({
        connectionStatus: status,
        retryInfo: {
          ...state.retryInfo,
          currentAttempt: attempt,
          status
        }
      }))

      try {
        await get()._attemptConnection()
        console.log('🎉 [ConnectionManager] 连接成功')
        
        // 连接成功，重置重试计数
        set(state => ({
          connectionStatus: ConnectionStatus.CONNECTED,
          retryInfo: {
            ...state.retryInfo,
            currentAttempt: 0,
            status: ConnectionStatus.CONNECTED,
            error: undefined
          }
        }))
        return
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '连接失败'
        console.error(`[ConnectionManager] 第${attempt + 1}次连接失败:`, errorMessage)
        
        // 更新错误信息
        set(state => ({
          retryInfo: {
            ...state.retryInfo,
            currentAttempt: attempt + 1,
            error: errorMessage
          }
        }))

        // 如果这不是最后一次尝试，等待后重试
        if (attempt < totalAttempts - 1) {
          // 确保延迟数组索引不越界
          const delayIndex = Math.min(attempt, RETRY_CONFIG.delays.length - 1)
          const delayMs = RETRY_CONFIG.delays[delayIndex]
          console.log(`[ConnectionManager] ${delayMs/1000}秒后进行第${attempt + 2}次尝试`)
          await delay(delayMs)
        }
      }
    }
    
    // 所有尝试都失败了
    console.error(`[ConnectionManager] 所有连接尝试都失败了`)
    set(state => ({
      connectionStatus: ConnectionStatus.FAILED,
      retryInfo: {
        ...state.retryInfo,
        status: ConnectionStatus.FAILED,
        error: `所有重试都失败`
      }
    }))
    throw new Error(`连接失败，已重试${RETRY_CONFIG.maxAttempts}次`)
  },

  // 连接管理方法
  initialize: async () => {
    console.log('🔄 [ConnectionManager] initialize() 开始...')
    
    // 检查是否真正连接，而不只是初始化标志
    const state = get()
    if (state.isInitialized && webSocketClient.isConnected()) {
      console.log('✅ [ConnectionManager] 连接已初始化且WebSocket已连接，跳过')
      return
    }

    console.log('🔧 [ConnectionManager] 重置初始化状态')
    set({ isInitialized: false })

    // 设置状态变更回调，让WebSocket通过这个回调更新状态
    setupStatusHandler(get)

    try {
      console.log('🔗 [ConnectionManager] 调用带重试的连接')
      // 使用带重试的连接方法
      await get()._connectWithRetry()
      set({ isInitialized: true })
      console.log('🎉 [ConnectionManager] 连接初始化成功')
    } catch (error) {
      console.error('❌ [ConnectionManager] 连接初始化失败:', error)
      set({ isInitialized: false })  // 失败时确保标志为false
      throw error
    }
  },

  destroy: () => {
    webSocketClient.disconnect()
    set({ 
      isInitialized: false,
      connectionStatus: ConnectionStatus.DISCONNECTED,
      connectionError: null,
      retryInfo: {
        currentAttempt: 0,
        maxAttempts: RETRY_CONFIG.maxAttempts,
        status: ConnectionStatus.DISCONNECTED
      }
    })
    console.log('[ConnectionManager] 连接已销毁')
  },

  reconnect: async () => {
    console.log('🔄 [ConnectionManager] reconnect() 开始...')
    console.log('🔧 [ConnectionManager] 重置初始化状态')
    set({ isInitialized: false })

    // 重新设置状态变更回调，确保重连后状态能正确同步
    setupStatusHandler(get)
    
    try {
      console.log('🔌 [ConnectionManager] 先断开现有连接')
      webSocketClient.disconnect()
      
      console.log('🔗 [ConnectionManager] 调用带重试的连接')
      await get()._connectWithRetry()
      set({ isInitialized: true })
      console.log('🎉 [ConnectionManager] 重连成功')
    } catch (error) {
      console.error('❌ [ConnectionManager] 重连失败:', error)
      set({ isInitialized: false })  // 失败时确保标志为false
      throw error
    }
  },

  resetConnection: async () => {
    try {
      await get().reconnect()
    } catch (error) {
      console.error('[ConnectionManager] 重连失败:', error)
    }
  },

  initializeApp: async () => {
    try {
      console.log('[ConnectionManager] 初始化聊天服务...')
      // 连接WebSocket
      await get().initialize()
      
      // 添加消息处理器
      webSocketClient.addNewMessageHandler(useMessageManagerStore.getState().handleWebSocketMessage)
      webSocketClient.addReceiptHandler(useMessageManagerStore.getState().handleMessageReceipt)
      
      // 添加通知处理器
      webSocketClient.addNotificationHandler(useNotificationManagerStore.getState().handleNotification)
      
      const currentRetryInfo = get().retryInfo
      get().updateConnectionState(currentRetryInfo)
      
      console.log('[ConnectionManager] 聊天服务初始化完成')
    } catch (error) {
      console.error('[ConnectionManager] 初始化聊天服务失败:', error)
      
      // 调用错误回调
      get().setConnectionStatus(ConnectionStatus.FAILED, error instanceof Error ? error.message : '未知错误')
      
      throw error
    }
  }
}))