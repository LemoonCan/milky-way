import { create } from 'zustand'
import { ConnectionStatus, type RetryInfo, type MessageDTOHandler, type WebSocketMessage } from '../utils/websocket'
import { webSocketClient } from '../utils/websocket'
import { messageManager } from './messageManager'

/**
 * 连接管理Store - 统一管理WebSocket连接状态和操作
 */
export interface ConnectionManagerStore {
  // 状态数据
  connectionStatus: ConnectionStatus
  connectionError: string | null
  retryInfo: RetryInfo
  isInitialized: boolean
  statusChangeCallback?: (retryInfo: RetryInfo) => void

  // 状态查询方法
  isConnected: () => boolean
  isConnecting: () => boolean
  isRetrying: () => boolean
  isFailed: () => boolean
  isReady: () => boolean
  getConnectionDisplayText: () => string

  // 状态更新方法
  updateConnectionState: (retryInfo: RetryInfo) => void
  setConnectionStatus: (status: ConnectionStatus, error?: string) => void
  clearError: () => void

  // 连接管理方法
  initialize: () => Promise<void>
  destroy: () => void
  reconnect: () => Promise<void>
  resetConnection: () => Promise<void>

  // 消息处理器管理
  addMessageHandler: (handler: (message: WebSocketMessage) => void) => void
  removeMessageHandler: (handler: (message: WebSocketMessage) => void) => void
  addMessageDTOHandler: (handler: MessageDTOHandler) => void
  removeMessageDTOHandler: (handler: MessageDTOHandler) => void
  addReceiptHandler: (handler: (receipt: import('../utils/websocket').MessageReceipt) => void) => void
  removeReceiptHandler: (handler: (receipt: import('../utils/websocket').MessageReceipt) => void) => void

  // 高级初始化方法
  setStatusChangeCallback: (callback: (retryInfo: RetryInfo) => void) => void
  initializeChatService: (options?: {
    statusChangeCallback?: (retryInfo: RetryInfo) => void
    messageHandlers?: {
      messageDTO?: MessageDTOHandler
      receipt?: (receipt: import('../utils/websocket').MessageReceipt) => void
    }
    onSuccess?: (retryInfo: RetryInfo) => void
    onError?: (error: Error) => void
  }) => Promise<void>
  initializeChatApp: () => Promise<void>
}

export const useConnectionManagerStore = create<ConnectionManagerStore>((set, get) => ({
  // 初始状态
  connectionStatus: ConnectionStatus.DISCONNECTED,
  connectionError: null,
  retryInfo: {
    currentAttempt: 0,
    maxAttempts: 3,
    status: ConnectionStatus.DISCONNECTED
  },
  isInitialized: false,
  statusChangeCallback: undefined,

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

  isReady: () => {
    const state = get()
    const ready = state.isInitialized && webSocketClient.isConnected()
    console.log('🔍 [ConnectionManager] isReady() 检查:', {
      isInitialized: state.isInitialized,
      isConnected: webSocketClient.isConnected(),
      ready
    })
    return ready
  },

  getConnectionDisplayText: () => {
    const state = get()
    switch (state.connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return '已连接'
      case ConnectionStatus.CONNECTING:
        return '连接中...'
      case ConnectionStatus.RETRYING:
        return `重连中... (${state.retryInfo.currentAttempt}/${state.retryInfo.maxAttempts})`
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
    set({
      connectionStatus: status,
      connectionError: error || null
    })
    
    // 如果有状态变更回调，调用它
    const state = get()
    if (state.statusChangeCallback) {
      const retryInfo: RetryInfo = {
        ...state.retryInfo,
        status,
        error
      }
      state.statusChangeCallback(retryInfo)
    }
  },

  clearError: () => {
    set({ connectionError: null })
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

    try {
      console.log('🔗 [ConnectionManager] 调用 webSocketClient.connect()')
      // 建立WebSocket连接
      await webSocketClient.connect()
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
      statusChangeCallback: undefined
    })
    console.log('[ConnectionManager] 连接已销毁')
  },

  reconnect: async () => {
    console.log('🔄 [ConnectionManager] reconnect() 开始...')
    console.log('🔧 [ConnectionManager] 重置初始化状态')
    set({ isInitialized: false })
    
    try {
      console.log('🔗 [ConnectionManager] 调用 webSocketClient.reset()')
      await webSocketClient.reset()
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

  // 消息处理器管理
  addMessageHandler: (handler: (message: WebSocketMessage) => void) => {
    webSocketClient.addMessageHandler(handler)
  },

  removeMessageHandler: (handler: (message: WebSocketMessage) => void) => {
    webSocketClient.removeMessageHandler(handler)
  },

  addMessageDTOHandler: (handler: MessageDTOHandler) => {
    webSocketClient.addMessageDTOHandler(handler)
  },

  removeMessageDTOHandler: (handler: MessageDTOHandler) => {
    webSocketClient.removeMessageDTOHandler(handler)
  },

  addReceiptHandler: (handler: (receipt: import('../utils/websocket').MessageReceipt) => void) => {
    webSocketClient.addReceiptHandler(handler)
  },

  removeReceiptHandler: (handler: (receipt: import('../utils/websocket').MessageReceipt) => void) => {
    webSocketClient.removeReceiptHandler(handler)
  },

  // 高级初始化方法
  setStatusChangeCallback: (callback: (retryInfo: RetryInfo) => void) => {
    set({ statusChangeCallback: callback })
    webSocketClient.setStatusChangeCallback(callback)
  },

  initializeChatService: async (options?: {
    statusChangeCallback?: (retryInfo: RetryInfo) => void
    messageHandlers?: {
      messageDTO?: MessageDTOHandler
      receipt?: (receipt: import('../utils/websocket').MessageReceipt) => void
    }
    onSuccess?: (retryInfo: RetryInfo) => void
    onError?: (error: Error) => void
  }) => {
    try {
      console.log('[ConnectionManager] 初始化聊天服务...')
      
      // 设置状态变更回调
      if (options?.statusChangeCallback) {
        get().setStatusChangeCallback(options.statusChangeCallback)
      }
      
      // 连接WebSocket
      await get().initialize()
      
      // 添加消息处理器
      if (options?.messageHandlers?.messageDTO) {
        get().addMessageDTOHandler(options.messageHandlers.messageDTO)
      }
      
      if (options?.messageHandlers?.receipt) {
        get().addReceiptHandler(options.messageHandlers.receipt)
      }
      
      const currentRetryInfo = webSocketClient.getRetryInfo()
      
      // 调用成功回调
      if (options?.onSuccess) {
        options.onSuccess(currentRetryInfo)
      }
      
      console.log('[ConnectionManager] 聊天服务初始化完成，状态:', webSocketClient.getConnectionStatus())
    } catch (error) {
      console.error('[ConnectionManager] 初始化聊天服务失败:', error)
      
      // 调用错误回调
      if (options?.onError && error instanceof Error) {
        options.onError(error)
      }
      
      throw error
    }
  },

  initializeChatApp: async () => {
    try {
      console.log('[ConnectionManager] 初始化聊天应用...')
      
      await get().initializeChatService({
        statusChangeCallback: (retryInfo: RetryInfo) => {
          console.log('[ConnectionManager] 连接状态更新:', retryInfo)
          
          // 更新连接状态
          const store = get()
          const prevStatus = store.connectionStatus
          store.updateConnectionState(retryInfo)
          
          // 如果连接断开，标记所有发送中的消息为失败
          if (prevStatus === ConnectionStatus.CONNECTED && 
              retryInfo.status !== ConnectionStatus.CONNECTED) {
            console.log('[ConnectionManager] 连接断开，标记所有发送中的消息为失败')
            // 动态导入避免循环依赖
            import('./chat').then(({ useChatStore }) => {
              useChatStore.getState().markAllSendingMessagesAsFailed()
            })
          }
        },
        messageHandlers: {
          messageDTO: messageManager.handleWebSocketMessage.bind(messageManager),
          receipt: messageManager.handleMessageReceipt.bind(messageManager)
        },
        onSuccess: (retryInfo: RetryInfo) => {
          // 更新连接状态
          get().updateConnectionState(retryInfo)
        },
        onError: (error: Error) => {
          // 更新错误状态
          get().setConnectionStatus(ConnectionStatus.FAILED, error.message)
        }
      })
      
      console.log('[ConnectionManager] 聊天应用初始化完成')
    } catch (error) {
      console.error('[ConnectionManager] 初始化聊天应用失败:', error)
      throw error
    }
  }
}))

// 导出单例实例供非React组件使用
export const connectionManager = {
  ...useConnectionManagerStore.getState(),
  // 更新方法需要获取最新状态
  getState: () => useConnectionManagerStore.getState(),
  setState: useConnectionManagerStore.setState,
  subscribe: useConnectionManagerStore.subscribe
} 