import { create } from 'zustand'
import { chatService, type ChatInfoDTO, type Slices, type MessageDTO, type SimpleUserDTO } from '../services/chat'
import type { WebSocketMessage } from '../utils/websocket'
import { ConnectionStatus, type RetryInfo } from '../utils/websocket'

export interface Message {
  id: string
  content: string
  sender: 'me' | 'other'
  senderInfo?: SimpleUserDTO
  timestamp: Date
  type: 'text' | 'image' | 'file'
  sendStatus?: 'sending' | 'sent' | 'failed' // 添加发送状态
}

export interface ChatUser {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  online: boolean
}

// 添加聊天消息状态接口
export interface ChatMessagesState {
  messages: Message[]
  isLoading: boolean
  hasMore: boolean
  hasMoreOlder: boolean
  oldestMessageId?: string
  newestMessageId?: string
  error?: string
}

export interface ChatStore {
  currentChatId: string | null
  chatUsers: ChatUser[]
  // 修改messages类型为包含更多状态信息
  chatMessagesMap: Record<string, ChatMessagesState>
  connectionStatus: ConnectionStatus
  connectionError: string | null
  isLoading: boolean
  hasMoreChats: boolean
  lastChatId?: string
  retryInfo: RetryInfo
  setCurrentChat: (chatId: string) => void
  // 更新方法签名
  loadChatMessages: (chatId: string, refresh?: boolean) => Promise<void>
  loadMoreOlderMessages: (chatId: string) => Promise<void>
  addMessage: (chatId: string, message: Omit<Message, 'id'> & { id?: string }) => void
  updateMessageSendStatus: (chatId: string, messageId: string, status: 'sending' | 'sent' | 'failed') => void
  clearMessageSendStatus: (chatId: string, messageId: string) => void
  getChatMessages: (chatId: string) => Message[]
  markChatAsRead: (chatId: string) => Promise<void>
  initializeChatService: () => Promise<void>
  sendMessageViaWebSocket: (chatId: string, content: string) => Promise<void>
  handleWebSocketMessage: (wsMessage: WebSocketMessage) => void
  addRealTimeMessage: (chatId: string, wsMessage: WebSocketMessage) => void
  setConnectionStatus: (status: ConnectionStatus, error?: string) => void
  loadChatList: (refresh?: boolean) => Promise<void>
  loadMoreChats: () => Promise<void>
  resetConnection: () => Promise<void>
  updateRetryInfo: (retryInfo: RetryInfo) => void
  // 新增便利方法
  isConnected: () => boolean
  isConnecting: () => boolean
  isRetrying: () => boolean
  isFailed: () => boolean
  getConnectionDisplayText: () => string
}

// Mock 数据
const mockUsers: ChatUser[] = [
  {
    id: 'user-zhang',
    name: '复古柠檬',
    avatar: '', // 使用生成头像避免外部请求失败
    lastMessage: '你好，最近怎么样？',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    unreadCount: 2,
    online: true,
  },
  {
    id: 'user-li',
    name: '变形胖机智哥',
    avatar: '', // 使用生成头像
    lastMessage: '今天天气不错啊',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    unreadCount: 0,
    online: false,
  },
  {
    id: 'user-wang',
    name: '变形胖机智哥',
    avatar: '', // 使用生成头像
    lastMessage: '明天见面聊',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4小时前
    unreadCount: 1,
    online: true,
  },
  {
    id: 'user-zhao',
    name: '红色柠檬',
    avatar: '', // 使用生成头像
    lastMessage: '好的，没问题',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
    unreadCount: 0,
    online: false,
  },
  {
    id: 'user-chen',
    name: '小白白',
    avatar: '', // 使用生成头像避免外部请求失败
    lastMessage: '周末一起看电影吧',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6小时前
    unreadCount: 3,
    online: true,
  },
  {
    id: 'user-wu',
    name: 'BQ',
    avatar: '', // 使用生成头像
    lastMessage: '项目进展如何？',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8小时前
    unreadCount: 0,
    online: false,
  },
  {
    id: 'user-zhou',
    name: '周九',
    avatar: '', // 使用生成头像避免外部请求失败
    lastMessage: '晚上有空吗？',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12小时前
    unreadCount: 1,
    online: true,
  },
  {
    id: 'user-feng',
    name: '冯十',
    avatar: '', // 使用生成头像
    lastMessage: '收到，谢谢！',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18小时前
    unreadCount: 0,
    online: false,
  },
]

// Mock messages are now loaded from API, keeping the mock users for backward compatibility

// 转换后端 MessageDTO 到前端 Message 格式
const convertMessageDTOToMessage = (messageDTO: MessageDTO): Message => {
  // 直接使用后端返回的senderType，不再需要比较用户ID
  
  // 安全地处理时间转换
  let timestamp: Date
  try {
    timestamp = new Date(messageDTO.sentTime)
    if (isNaN(timestamp.getTime())) {
      console.warn('无效的时间格式:', messageDTO.sentTime, '使用当前时间')
      timestamp = new Date()
    }
  } catch (error) {
    console.error('时间转换失败:', error, '使用当前时间')
    timestamp = new Date()
  }

  return {
    id: messageDTO.id,
    content: messageDTO.content,
    sender: messageDTO.senderType, // 直接使用后端返回的senderType
    senderInfo: messageDTO.sender,
    timestamp,
    type: messageDTO.type === 'IMAGE' ? 'image' : 
          messageDTO.type === 'FILE' ? 'file' : 'text',
    sendStatus: messageDTO.senderType === 'me' ? 'sent' : undefined // 我发送的消息显示成功状态
  }
}

// 转换后端 ChatInfoDTO 到前端 ChatUser 格式
const convertChatInfoToUser = (chatInfo: ChatInfoDTO): ChatUser => {
  // 安全地处理时间转换
  let lastMessageTime: Date
  try {
    // 如果是字符串，直接创建 Date 对象
    if (typeof chatInfo.lastMessageTime === 'string') {
      lastMessageTime = new Date(chatInfo.lastMessageTime)
    } else {
      // 如果已经是 Date 对象或其他类型，也尝试转换
      lastMessageTime = new Date(chatInfo.lastMessageTime)
    }
    
    // 检查转换后的日期是否有效
    if (isNaN(lastMessageTime.getTime())) {
      console.warn('无效的时间格式:', chatInfo.lastMessageTime, '使用当前时间')
      lastMessageTime = new Date()
    }
  } catch (error) {
    console.error('时间转换失败:', error, '使用当前时间')
    lastMessageTime = new Date()
  }

  return {
    id: chatInfo.id,
    name: chatInfo.title,
    avatar: chatInfo.avatar,
    lastMessage: chatInfo.lastMessage,
    lastMessageTime,
    unreadCount: chatInfo.unreadCount,
    online: chatInfo.online
  }
}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentChatId: null,
  chatUsers: mockUsers,
  chatMessagesMap: {},
  connectionStatus: ConnectionStatus.DISCONNECTED,
  connectionError: null,
  isLoading: false,
  hasMoreChats: true,
  lastChatId: undefined,
  retryInfo: {
    currentAttempt: 0,
    maxAttempts: 3,
    status: ConnectionStatus.DISCONNECTED
  },
  
  setCurrentChat: (chatId: string) => {
    set({ currentChatId: chatId })
    
    const state = get()
    
    // 当切换聊天时，如果该聊天还没有加载过消息，则加载最新消息
    if (!state.chatMessagesMap[chatId]) {
      get().loadChatMessages(chatId, true)
    }
    
    // 异步标记消息为已读（不等待完成）
    setTimeout(() => {
      get().markChatAsRead(chatId).catch(error => {
        console.error(`[ChatStore] 自动标记聊天 ${chatId} 已读失败:`, error)
      })
    }, 100) // 稍微延迟执行，确保页面切换流畅
  },
  
  loadChatMessages: async (chatId: string, refresh = false) => {
    const state = get()
    const currentChatState = state.chatMessagesMap[chatId]
    
    // 如果正在加载，则跳过
    if (currentChatState?.isLoading) return
    
    try {
      // 更新加载状态
      set({
        chatMessagesMap: {
          ...state.chatMessagesMap,
          [chatId]: {
            ...currentChatState,
            isLoading: true,
            error: undefined
          }
        }
      })
      
      // 获取消息，默认加载最新的20条消息
      const result = await chatService.getChatMessages({
        chatId,
        pageSize: 20
        // 不传before和after，默认获取最新消息
      })
      
      const messages = result.items.map(dto => convertMessageDTOToMessage(dto))
      
      set({
        chatMessagesMap: {
          ...get().chatMessagesMap,
          [chatId]: {
            messages: refresh ? messages : [...(currentChatState?.messages || []), ...messages],
            isLoading: false,
            hasMore: true, // 总是假设有更多新消息
            hasMoreOlder: result.hasNext, // 是否有更老的消息
            oldestMessageId: messages.length > 0 ? messages[0].id : undefined,
            newestMessageId: messages.length > 0 ? messages[messages.length - 1].id : undefined,
            error: undefined
          }
        }
      })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载消息失败'
      set({
        chatMessagesMap: {
          ...get().chatMessagesMap,
          [chatId]: {
            ...currentChatState,
            isLoading: false,
            error: errorMessage
          }
        }
      })
      console.error('加载聊天消息失败:', error)
    }
  },
  
  loadMoreOlderMessages: async (chatId: string) => {
    const state = get()
    const currentChatState = state.chatMessagesMap[chatId]
    
    // 如果正在加载或没有更多旧消息，则跳过
    if (currentChatState?.isLoading || !currentChatState?.hasMoreOlder) return
    
    try {
      set({
        chatMessagesMap: {
          ...state.chatMessagesMap,
          [chatId]: {
            ...currentChatState,
            isLoading: true
          }
        }
      })
      
      // 获取更旧的消息
      const result = await chatService.getChatMessages({
        chatId,
        before: currentChatState.oldestMessageId, // 获取在最旧消息之前的消息
        pageSize: 20
      })
      
      const olderMessages = result.items.map(dto => convertMessageDTOToMessage(dto))
      
      set({
        chatMessagesMap: {
          ...get().chatMessagesMap,
          [chatId]: {
            ...currentChatState,
            messages: [...olderMessages, ...currentChatState.messages], // 旧消息放在前面
            isLoading: false,
            hasMoreOlder: result.hasNext,
            oldestMessageId: olderMessages.length > 0 ? olderMessages[0].id : currentChatState.oldestMessageId,
          }
        }
      })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载更多消息失败'
      set({
        chatMessagesMap: {
          ...get().chatMessagesMap,
          [chatId]: {
            ...currentChatState,
            isLoading: false,
            error: errorMessage
          }
        }
      })
      console.error('加载更多旧消息失败:', error)
    }
  },
  
  addMessage: (chatId: string, message: Omit<Message, 'id'> & { id?: string }) => {
    const state = get()
    const currentChatState = state.chatMessagesMap[chatId] || {
      messages: [],
      isLoading: false,
      hasMore: true,
      hasMoreOlder: false
    }
    
    const newMessage = {
      ...message,
      id: message.id || `${chatId}-${Date.now()}`,
    }
    
    set({
      chatMessagesMap: {
        ...state.chatMessagesMap,
        [chatId]: {
          ...currentChatState,
          messages: [...currentChatState.messages, newMessage],
          newestMessageId: newMessage.id
        }
      }
    })
  },

  updateMessageSendStatus: (chatId: string, messageId: string, status: 'sending' | 'sent' | 'failed') => {
    const state = get()
    const currentChatState = state.chatMessagesMap[chatId]
    if (!currentChatState) return

    const updatedMessages = currentChatState.messages.map(msg => 
      msg.id === messageId ? { ...msg, sendStatus: status } : msg
    )

    set({
      chatMessagesMap: {
        ...state.chatMessagesMap,
        [chatId]: {
          ...currentChatState,
          messages: updatedMessages
        }
      }
    })
  },

  clearMessageSendStatus: (chatId: string, messageId: string) => {
    const state = get()
    const currentChatState = state.chatMessagesMap[chatId]
    if (!currentChatState) return

    const updatedMessages = currentChatState.messages.map(msg => 
      msg.id === messageId ? { ...msg, sendStatus: undefined } : msg
    )

    set({
      chatMessagesMap: {
        ...state.chatMessagesMap,
        [chatId]: {
          ...currentChatState,
          messages: updatedMessages
        }
      }
    })
  },
  
  getChatMessages: (chatId: string) => {
    const state = get()
    return state.chatMessagesMap[chatId]?.messages || []
  },

  markChatAsRead: async (chatId: string) => {
    const state = get()
    
    // 查找对应的聊天用户
    const chatUser = state.chatUsers.find(user => user.id === chatId)
    if (!chatUser || chatUser.unreadCount === 0) {
      console.log(`[ChatStore] 聊天 ${chatId} 没有未读消息，跳过标记已读`)
      return
    }

    // 获取该聊天的消息状态
    const chatMessagesState = state.chatMessagesMap[chatId]
    
    // 如果还没有消息数据，先加载消息
    if (!chatMessagesState || !chatMessagesState.messages || chatMessagesState.messages.length === 0) {
      console.log(`[ChatStore] 聊天 ${chatId} 还没有消息数据，先加载消息`)
      await get().loadChatMessages(chatId, true)
      const updatedState = get()
      const updatedChatMessagesState = updatedState.chatMessagesMap[chatId]
      if (!updatedChatMessagesState || !updatedChatMessagesState.messages || updatedChatMessagesState.messages.length === 0) {
        console.warn(`[ChatStore] 加载消息后仍然没有消息数据，无法标记已读`)
        return
      }
    }

    // 获取最新消息ID
    const latestChatMessagesState = get().chatMessagesMap[chatId]
    const latestMessageId = latestChatMessagesState.newestMessageId || latestChatMessagesState.messages[latestChatMessagesState.messages.length - 1]?.id
    
    if (!latestMessageId) {
      console.warn(`[ChatStore] 无法获取聊天 ${chatId} 的最新消息ID，无法标记已读`)
      return
    }

    try {
      console.log(`[ChatStore] 开始标记聊天 ${chatId} 的消息已读，最新消息ID: ${latestMessageId}`)
      
      // 调用后端接口标记消息已读
      await chatService.markMessagesAsRead({
        chatId,
        messageId: latestMessageId
      })

      // 标记成功后，更新本地状态：将该聊天的未读数量设为0
      const currentState = get()
      const updatedChatUsers = currentState.chatUsers.map(user => {
        if (user.id === chatId) {
          return {
            ...user,
            unreadCount: 0
          }
        }
        return user
      })

      set({
        chatUsers: updatedChatUsers
      })

      console.log(`[ChatStore] 成功标记聊天 ${chatId} 的消息已读`)
    } catch (error) {
      console.error(`[ChatStore] 标记聊天 ${chatId} 消息已读失败:`, error)
      // 标记失败时不更新本地状态
    }
  },

  initializeChatService: async () => {
    try {
      console.log('🔄 [ChatStore] 开始初始化聊天服务...')
      set({ connectionError: null })
      
      // 获取当前连接状态
      const currentStatus = chatService.getConnectionStatus()
      const currentRetryInfo = chatService.getRetryInfo()
      console.log('📊 [ChatStore] 当前WebSocket状态:', currentStatus)
      
      // 设置状态变更回调
      chatService.setStatusChangeCallback((retryInfo: RetryInfo) => {
        console.log('📡 [ChatStore] 连接状态更新:', retryInfo)
        set({ 
          retryInfo,
          connectionStatus: retryInfo.status,
          connectionError: retryInfo.error || null
        })
      })
      
      // 如果已经连接，直接设置状态并添加消息处理器
      if (currentStatus === ConnectionStatus.CONNECTED) {
        console.log('✅ [ChatStore] WebSocket已连接，直接设置状态')
        set({ 
          connectionStatus: currentStatus,
          retryInfo: currentRetryInfo,
          connectionError: null
        })
        chatService.addMessageHandler(get().handleWebSocketMessage)
        return
      }
      
      // 如果正在连接中，等待连接完成
      if (currentStatus === ConnectionStatus.CONNECTING || currentStatus === ConnectionStatus.RETRYING) {
        console.log('⏳ [ChatStore] WebSocket正在连接中，等待连接完成...')
        set({ 
          connectionStatus: currentStatus,
          retryInfo: currentRetryInfo
        })
        return
      }
      
      // 初始化连接
      console.log('🚀 [ChatStore] 开始建立WebSocket连接...')
      console.log('🔗 [ChatStore] 调用 chatService.initialize()')
      await chatService.initialize()
      console.log('✅ [ChatStore] chatService.initialize() 完成')
      
      // 添加消息处理器
      chatService.addMessageHandler(get().handleWebSocketMessage)
      
      const finalRetryInfo = chatService.getRetryInfo()
      const finalStatus = chatService.getConnectionStatus()
      set({ 
        connectionStatus: finalStatus,
        retryInfo: finalRetryInfo,
        connectionError: null
      })
      console.log('🎉 [ChatStore] 聊天服务初始化完成，最终状态:', finalStatus)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '连接失败'
      const currentRetryInfo = chatService.getRetryInfo()
      const currentStatus = chatService.getConnectionStatus()
      set({ 
        connectionStatus: currentStatus,
        connectionError: errorMessage,
        retryInfo: currentRetryInfo
      })
      console.error('❌ [ChatStore] 初始化聊天服务失败:', error)
      console.error('📊 [ChatStore] 失败时的状态:', currentStatus)
    }
  },

  sendMessageViaWebSocket: async (chatId: string, content: string) => {
    const messageId = `${chatId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 立即添加到本地消息列表，状态为发送中
    get().addMessage(chatId, {
      id: messageId,
      content,
      sender: 'me',
      timestamp: new Date(),
      type: 'text',
      sendStatus: 'sending'
    })

    // 发送消息的内部函数，支持重试
    const trySendMessage = async (attempt: number = 1): Promise<void> => {
      try {
        if (!get().isConnected()) {
          throw new Error('WebSocket未连接')
        }
        
        // 发送消息
        await chatService.sendMessage({
          chatId,
          content,
          messageType: 'TEXT'
        })
        
        // 发送成功，更新状态（保持显示成功图标）
        get().updateMessageSendStatus(chatId, messageId, 'sent')
        
      } catch (error) {
        console.error(`[ChatStore] 发送消息失败，第${attempt}次尝试:`, error)
        
        if (attempt < 3) {
          // 还有重试机会，继续尝试
          console.log(`[ChatStore] 准备进行第${attempt + 1}次重试...`)
          // 短暂延迟后重试
          setTimeout(() => {
            trySendMessage(attempt + 1)
          }, 1000 * attempt) // 递增延迟：1秒、2秒
        } else {
          // 3次都失败了，标记为失败
          console.error('[ChatStore] 消息发送失败，已重试3次')
          get().updateMessageSendStatus(chatId, messageId, 'failed')
        }
      }
    }

    // 开始发送
    await trySendMessage()
  },

  handleWebSocketMessage: (wsMessage: WebSocketMessage) => {
    console.log('[ChatStore] 处理WebSocket消息:', wsMessage)
    get().addRealTimeMessage(wsMessage.chatId, wsMessage)
  },

  addRealTimeMessage: (chatId: string, wsMessage: WebSocketMessage) => {
    const state = get()
    const currentChatState = state.chatMessagesMap[chatId] || {
      messages: [],
      isLoading: false,
      hasMore: true,
      hasMoreOlder: false
    }
    
    // 创建新的消息对象
    const newMessage: Message = {
      id: `ws-${Date.now()}-${Math.random()}`,
      content: wsMessage.content,
      sender: 'other', // 从WebSocket接收的消息都是别人发的
      timestamp: wsMessage.timestamp ? new Date(wsMessage.timestamp) : new Date(),
      type: wsMessage.messageType === 'IMAGE' ? 'image' : 
            wsMessage.messageType === 'FILE' ? 'file' : 'text'
    }
    
    set({
      chatMessagesMap: {
        ...state.chatMessagesMap,
        [chatId]: {
          ...currentChatState,
          messages: [...currentChatState.messages, newMessage],
          newestMessageId: newMessage.id
        }
      }
    })

    // 更新聊天列表中的最后消息
    const chatUsers = state.chatUsers
    const updatedUsers = chatUsers.map(user => {
      if (user.id === chatId) {
        return {
          ...user,
          lastMessage: wsMessage.content,
          lastMessageTime: new Date(),
          unreadCount: user.id === state.currentChatId ? user.unreadCount : user.unreadCount + 1
        }
      }
      return user
    })
    
    set({ chatUsers: updatedUsers })
  },

  setConnectionStatus: (status: ConnectionStatus, error?: string) => {
    set({ 
      connectionStatus: status,
      connectionError: error || null 
    })
  },

  loadChatList: async (refresh = false) => {
    const state = get()
    if (state.isLoading) return
    
    try {
      set({ isLoading: true, connectionError: null })
      
      // 移除自动重连逻辑，避免重复重试
      // 刷新操作应该由UI层面（ChatList组件）统一控制WebSocket重连
      
      // 如果是刷新，重置分页状态
      const lastId = refresh ? undefined : state.lastChatId
      
      const result: Slices<ChatInfoDTO> = await chatService.getChatList(lastId, 20)
      
      const newUsers = result.items.map(convertChatInfoToUser)
      
      set({
        chatUsers: refresh ? newUsers : [...state.chatUsers, ...newUsers],
        hasMoreChats: result.hasNext,
        lastChatId: result.lastId,
        isLoading: false
      })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取聊天列表失败'
      set({ 
        isLoading: false,
        connectionError: errorMessage 
      })
      console.error('[ChatStore] 获取聊天列表失败:', error)
    }
  },

  loadMoreChats: async () => {
    const state = get()
    if (!state.hasMoreChats || state.isLoading) return
    
    await get().loadChatList(false)
  },

  resetConnection: async () => {
    try {
      console.log('🔄 [ChatStore] 开始重置连接...')
      set({ connectionError: null })
      
      // 设置状态变更回调
      chatService.setStatusChangeCallback((retryInfo: RetryInfo) => {
        console.log('📡 [ChatStore] 重连状态更新:', retryInfo)
        set({ 
          retryInfo,
          connectionStatus: retryInfo.status,
          connectionError: retryInfo.error || null
        })
      })
      
      console.log('🔗 [ChatStore] 调用 chatService.reconnect()')
      await chatService.reconnect()
      console.log('✅ [ChatStore] chatService.reconnect() 完成')
      
      // 重新添加消息处理器
      chatService.addMessageHandler(get().handleWebSocketMessage)
      
      const currentRetryInfo = chatService.getRetryInfo()
      const currentStatus = chatService.getConnectionStatus()
      set({ 
        connectionStatus: currentStatus,
        retryInfo: currentRetryInfo,
        connectionError: null
      })
      console.log('🎉 [ChatStore] 重置连接成功，最终状态:', currentStatus)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '重置连接失败'
      const currentRetryInfo = chatService.getRetryInfo()
      const currentStatus = chatService.getConnectionStatus()
      set({ 
        connectionStatus: currentStatus,
        connectionError: errorMessage,
        retryInfo: currentRetryInfo
      })
      console.error('❌ [ChatStore] 重置连接失败:', error)
      console.error('📊 [ChatStore] 失败时的状态:', currentStatus)
    }
  },

  updateRetryInfo: (retryInfo: RetryInfo) => {
    set({
      retryInfo,
      connectionStatus: retryInfo.status
    })
  },

  // 便利方法
  isConnected: () => get().connectionStatus === ConnectionStatus.CONNECTED,
  isConnecting: () => get().connectionStatus === ConnectionStatus.CONNECTING,
  isRetrying: () => get().connectionStatus === ConnectionStatus.RETRYING,
  isFailed: () => get().connectionStatus === ConnectionStatus.FAILED,
  
  getConnectionDisplayText: () => {
    const state = get()
    switch (state.connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return '已连接'
      case ConnectionStatus.CONNECTING:
        return '连接中...'
      case ConnectionStatus.RETRYING:
        return '重试中...'
      case ConnectionStatus.FAILED:
        return '连接失败'
      case ConnectionStatus.DISCONNECTED:
      default:
        return '未连接'
    }
  }
})) 