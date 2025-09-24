import { create } from 'zustand'
import { Status } from '../services/websocket'
import { webSocketClient } from '../services/websocket'
import { useMessageManagerStore } from './messageManager'
import { useNotificationManagerStore } from './notificationManager'
import { useUserStore } from './user'

// 连接状态枚举
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RETRYING = 'retrying',
  FAILED = 'failed'
}

// 连接步骤枚举
export enum ConnectionStep {
  FETCH_USER_INFO = 'fetch_user_info',
  SETUP_STATUS_HANDLER = 'setup_status_handler',
  WEBSOCKET_CONNECT = 'websocket_connect',
  REGISTER_HANDLERS = 'register_handlers',
  COMPLETED = 'completed'
}

// 重试状态接口
export interface RetryInfo {
  currentAttempt: number
  status: ConnectionStatus
  error?: string
  lastCompletedStep?: ConnectionStep  // 最后完成的步骤
  failedStep?: ConnectionStep         // 失败的步骤
}

/**
 * 连接管理Store - 统一管理WebSocket连接状态和操作
 */
export interface ConnectionManagerStore {
  // 状态数据
  connectionStatus: ConnectionStatus
  connectionError: string | null
  retryInfo: RetryInfo
  initializing: boolean

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

  _connectWithRetry: () => Promise<void>
  _executeConnectionStep: (step: ConnectionStep) => Promise<void>
  _getNextStep: (currentStep?: ConnectionStep) => ConnectionStep | null

  // 初始化聊天服务
  initializeApp: () => Promise<void>
}

// 内部函数：设置WebSocket状态回调
const setupStatusHandler = (get: () => ConnectionManagerStore) => {
  webSocketClient.setStatusChangeHandler((status, error) => {    
    const currentState = get()

    if (currentState.connectionStatus == ConnectionStatus.RETRYING || 
      currentState.connectionStatus == ConnectionStatus.CONNECTING){
        return
    }
    
    // 只处理WebSocket能确定的状态，避免与重试逻辑冲突
    if (status === Status.CONNECTED) {
      // 连接成功，重置重试信息
      get().updateConnectionState({
        currentAttempt: 0,
        status: ConnectionStatus.CONNECTED,
        error: undefined,
        lastCompletedStep: ConnectionStep.COMPLETED,
        failedStep: undefined
      })
    } else if (status === Status.DISCONNECTED) {
      // 连接断开，但不覆盖正在进行的重试状态
      
        get().updateConnectionState({
          ...currentState.retryInfo,
          status: ConnectionStatus.DISCONNECTED,
          error: error || '连接断开',
          lastCompletedStep: ConnectionStep.COMPLETED,
          failedStep: undefined
        })
      
    }
  })
}

// 重试配置
const RETRY_CONFIG = {
  maxAttempts: 2,
  delays: [10000, 30000] // 10秒, 30秒
}

// 延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const useConnectionManagerStore = create<ConnectionManagerStore>((set, get) => ({
  // 初始状态
  connectionStatus: ConnectionStatus.DISCONNECTED,
  connectionError: null,
  retryInfo: {
    currentAttempt: 0,
    status: ConnectionStatus.DISCONNECTED
  },
  initializing: false,

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

  // 获取下一个需要执行的步骤
  _getNextStep: (currentStep?: ConnectionStep): ConnectionStep | null => {
    if (!currentStep) {
      return ConnectionStep.FETCH_USER_INFO
    }
    
    switch (currentStep) {
      case ConnectionStep.FETCH_USER_INFO:
        return ConnectionStep.SETUP_STATUS_HANDLER
      case ConnectionStep.SETUP_STATUS_HANDLER:
        return ConnectionStep.WEBSOCKET_CONNECT
      case ConnectionStep.WEBSOCKET_CONNECT:
        return ConnectionStep.REGISTER_HANDLERS
      case ConnectionStep.REGISTER_HANDLERS:
        return ConnectionStep.COMPLETED
      case ConnectionStep.COMPLETED:
        return null
      default:
        return ConnectionStep.FETCH_USER_INFO
    }
  },

  // 执行单个连接步骤
  _executeConnectionStep: async (step: ConnectionStep): Promise<void> => {    
    switch (step) {
      case ConnectionStep.FETCH_USER_INFO:
        await useUserStore.getState().fetchUserInfo(true)
        break
        
      case ConnectionStep.SETUP_STATUS_HANDLER:
        setupStatusHandler(get)
        break
        
      case ConnectionStep.WEBSOCKET_CONNECT:
        await webSocketClient.connect()
        break
        
      case ConnectionStep.REGISTER_HANDLERS:
        // 清理旧的handler，避免重复注册
        webSocketClient.clearAllHandlers()
        
        // 重新注册所有消息处理器
        webSocketClient.addNewMessageHandler(useMessageManagerStore.getState().handleNewMessage)
        webSocketClient.addReceiptHandler(useMessageManagerStore.getState().handleMessageReceipt)
        webSocketClient.addNotificationHandler(useNotificationManagerStore.getState().handleNotification)
        break
        
      case ConnectionStep.COMPLETED:
        break
        
      default:
        throw new Error(`未知的连接步骤: ${step}`)
    }
  },

  // 私有方法：带重试的连接（步骤化）
  _connectWithRetry: async (): Promise<void> => {    
    // 重置重试状态
    set(state => ({
      retryInfo: {
        ...state.retryInfo,
        currentAttempt: 0,
        error: undefined,
        lastCompletedStep: undefined,
        failedStep: undefined
      }
    }))

    // 总尝试次数 = 1次初始 + maxAttempts次重试
    const totalAttempts = RETRY_CONFIG.maxAttempts + 1
    
    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      
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
        // 从上次失败的步骤开始，或从第一步开始
        const currentState = get()
        let currentStep = get()._getNextStep(currentState.retryInfo.lastCompletedStep)
        
        // 执行所有剩余步骤
        while (currentStep && currentStep !== ConnectionStep.COMPLETED) {
          await get()._executeConnectionStep(currentStep)
          
          // 更新已完成的步骤
          set(state => ({
            retryInfo: {
              ...state.retryInfo,
              lastCompletedStep: currentStep as ConnectionStep,
              failedStep: undefined
            }
          }))
          
          currentStep = get()._getNextStep(currentStep)
        }
                
        // 连接成功，重置重试计数
        set(() => ({
          connectionStatus: ConnectionStatus.CONNECTED,
          retryInfo: {
            currentAttempt: 0,
            status: ConnectionStatus.CONNECTED,
            error: undefined,
            lastCompletedStep: ConnectionStep.COMPLETED,
            failedStep: undefined
          }
        }))
        return
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '连接失败'
        
        // 更新错误信息和失败步骤
        const currentState = get()
        const failedStep = get()._getNextStep(currentState.retryInfo.lastCompletedStep)
        
        set(state => ({
          retryInfo: {
            ...state.retryInfo,
            currentAttempt: attempt + 1,
            error: errorMessage,
            failedStep: failedStep || ConnectionStep.FETCH_USER_INFO
          }
        }))

        // 如果这不是最后一次尝试，等待后重试
        if (attempt < totalAttempts - 1) {
          // 确保延迟数组索引不越界
          const delayIndex = Math.min(attempt, RETRY_CONFIG.delays.length - 1)
          const delayMs = RETRY_CONFIG.delays[delayIndex]
          await delay(delayMs)
        }
      }
    }
    
    // 所有尝试都失败了
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
    // 检查是否真正连接，而不只是初始化标志
    const state = get()
    if (state.initializing) {
      return
    }

    // 如果已经连接，直接返回
    if (state.connectionStatus === ConnectionStatus.CONNECTED) {
      return
    }

    set({ initializing: true })

    try {
      // 使用带重试的连接方法
      await get()._connectWithRetry()
      set({ initializing: false })
    } catch (error) {
      set({ initializing: false })  // 失败时确保标志为false
      throw error
    }
  },

  destroy: () => {
    webSocketClient.disconnect()
    webSocketClient.clearAllHandlers()
    set({ 
      initializing: false,
      connectionStatus: ConnectionStatus.DISCONNECTED,
      connectionError: null,
      retryInfo: {
        currentAttempt: 0,
        status: ConnectionStatus.DISCONNECTED
      }
    })
  },

  initializeApp: async () => {
    try {      
      // 连接WebSocket（现在包含所有步骤：用户信息获取、连接、处理器注册）
      await get().initialize()
      
      const currentRetryInfo = get().retryInfo
      get().updateConnectionState(currentRetryInfo)
      
    } catch (error) {      
      // 调用错误回调
      get().setConnectionStatus(ConnectionStatus.FAILED, error instanceof Error ? error.message : '未知错误')
      
      throw error
    }
  }
}))