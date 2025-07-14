import { create } from 'zustand'
import { chatService, type ChatInfoDTO, type MessageDTO } from '../services/chat'
import { ConnectionStatus, type RetryInfo } from '../utils/websocket'
import { useUserStore } from './user'

// 工具函数：比较消息ID，选择最新的
const getNewestMessageId = (id1?: string, id2?: string): string | undefined => {
  if (!id1) return id2
  if (!id2) return id1
  // 优先选择非客户端生成的ID（服务端ID）
  if (id1.startsWith('temp-') && !id2.startsWith('temp-')) return id2
  if (id2.startsWith('temp-') && !id1.startsWith('temp-')) return id1
  // 都是服务端ID或都是客户端ID，选择较大的（假设ID是递增的）
  return id1 > id2 ? id1 : id2
}

// 工具函数：检查聊天是否有消息数据
const hasChatMessages = (chatState?: ChatMessagesState): boolean => {
  return !!(chatState?.messages && chatState.messages.length > 0)
}

// 工具函数：检查是否有新消息需要加载
const hasNewMessagesToLoad = (chatState?: ChatMessagesState, chatUser?: ChatUser): boolean => {
  if (!chatState || !chatUser || !chatUser.lastMessageId) {
    return false
  }
  
  // 检查是否有正在发送的消息，如果有则不重新加载
  const hasPendingMessages = chatState.messages.some(msg => 
    msg.clientMsgId && msg.sendStatus === 'sending'
  )
  
  if (hasPendingMessages) {
    console.log('[ChatStore] 有正在发送的消息，跳过重新加载')
    return false
  }
  
  // 如果聊天缓存中的最新消息ID与聊天列表中的最新消息ID不一致，说明有新消息
  const cachedNewestId = chatState.newestMessageId
  const actualNewestId = chatUser.lastMessageId
  
  // 如果缓存中没有最新消息ID，或者与实际最新消息ID不同，需要重新加载
  return !cachedNewestId || cachedNewestId !== actualNewestId
}

// 移除 Message 接口，直接使用 MessageDTO
// 添加前端特有的扩展字段
export interface MessageWithStatus extends MessageDTO {
  sendStatus?: 'sending' | 'sent' | 'failed' // 添加发送状态
  fileData?: {
    originalFile?: File
    isUploading?: boolean
    uploadProgress?: number
  }
}

export interface ChatUser {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  online: boolean
  lastMessageId?: string // 添加最新消息ID
  chatType: 'SINGLE' | 'GROUP' // 添加聊天类型字段
}

// 修改聊天消息状态接口
export interface ChatMessagesState {
  messages: MessageWithStatus[]
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
  chatMessagesMap: Record<string, ChatMessagesState>
  connectionStatus: ConnectionStatus
  connectionError: string | null
  isLoading: boolean
  hasMoreChats: boolean
  lastChatId?: string
  retryInfo: RetryInfo
  error: string | null
  setCurrentChat: (chatId: string) => Promise<void>
  loadChatMessages: (chatId: string, refresh?: boolean) => Promise<void>
  loadMoreOlderMessages: (chatId: string) => Promise<void>
  addMessage: (chatId: string, message: Omit<MessageWithStatus, 'id'> & { id?: string }) => void
  updateMessageSendStatus: (chatId: string, messageId: string, status: 'sending' | 'sent' | 'failed') => void
  updateMessageByClientId: (chatId: string, clientMsgId: string, updates: Partial<MessageWithStatus>) => void
  clearMessageSendStatus: (chatId: string, messageId: string) => void
  getChatMessages: (chatId: string) => MessageWithStatus[]
  markChatAsRead: (chatId: string, force?: boolean) => Promise<void>
  removeChatUser: (chatId: string) => void
  addChatLocally: (chatInfo: ChatInfoDTO) => void
  initializeChatService: () => Promise<void>
  sendMessageViaWebSocket: (chatId: string, content: string) => Promise<void>
  handleWebSocketMessage: (messageDTO: MessageDTO) => void
  handleMessageReceipt: (receipt: import('../utils/websocket').MessageReceipt) => void
  addRealTimeMessage: (chatId: string, messageDTO: MessageDTO) => void
  setConnectionStatus: (status: ConnectionStatus, error?: string) => void
  loadChatList: (refresh?: boolean) => Promise<void>
  loadMoreChats: () => Promise<void>
  resetConnection: () => Promise<void>
  updateRetryInfo: (retryInfo: RetryInfo) => void
  isConnected: () => boolean
  isConnecting: () => boolean
  isRetrying: () => boolean
  isFailed: () => boolean
  getConnectionDisplayText: () => string
  markAllSendingMessagesAsFailed: () => void
  setError: (error: string | null) => void
  clearError: () => void
}

// Mock 数据 - 已清理，连接失败时不再显示测试数据
const mockUsers: ChatUser[] = []

// Mock messages are now loaded from API

// 移除转换函数，添加工具函数用于组件中的判断
export const isMessageFromMe = (message: MessageDTO | MessageWithStatus): boolean => {
  const currentUserStore = useUserStore.getState()
  const currentUserId = currentUserStore.currentUser?.id
  
  if (currentUserId && message.sender.id) {
    return message.sender.id === currentUserId
  } else if ('clientMsgId' in message && message.clientMsgId) {
    // 备用判断：有clientMsgId的通常是自己发送的消息
    return true
  }
  
  return false
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
    online: chatInfo.online,
    chatType: chatInfo.chatType
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
  error: null,
  
  setCurrentChat: async (chatId: string) => {
    console.log(`[ChatStore] setCurrentChat 被调用，chatId: ${chatId}`)
    set({ currentChatId: chatId })
    
    const state = get()
    const chatUser = state.chatUsers.find(user => user.id === chatId)
    console.log(`[ChatStore] 找到聊天用户:`, chatUser ? `${chatUser.name}, 未读数量: ${chatUser.unreadCount}` : '未找到')
    
    const existingChatState = state.chatMessagesMap[chatId]
    
    // 检查是否需要加载消息
    const needsLoading = !hasChatMessages(existingChatState) || hasNewMessagesToLoad(existingChatState, chatUser)
    
    if (needsLoading) {
      const reason = !hasChatMessages(existingChatState) ? '没有消息数据' : '检测到新消息'
      console.log(`[ChatStore] 聊天 ${chatId} ${reason}，开始加载消息`)
      try {
        await get().loadChatMessages(chatId, true)
        console.log(`[ChatStore] 聊天 ${chatId} 消息加载完成`)
      } catch (error) {
        console.error(`[ChatStore] 聊天 ${chatId} 消息加载失败:`, error)
      }
    } else {
      console.log(`[ChatStore] 聊天 ${chatId} 已有 ${existingChatState.messages.length} 条消息，跳过加载`)
    }
    
    // 标记消息为已读
    console.log(`[ChatStore] 准备标记聊天 ${chatId} 为已读`)
    setTimeout(() => {
      console.log(`[ChatStore] 开始执行标记已读，chatId: ${chatId}`)
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
      
      const messages = result.items.map(dto => dto as MessageWithStatus)
      
      // 计算最新消息ID：优先使用已存在的 newestMessageId（可能是通过WebSocket更新的）
      const loadedNewestId = messages.length > 0 ? messages[messages.length - 1].id : undefined
      const existingNewestId = currentChatState?.newestMessageId
      
      const finalNewestMessageId = getNewestMessageId(existingNewestId, loadedNewestId)
      
      // 如果是refresh，需要保留正在发送的临时消息
      let finalMessages: MessageWithStatus[]
      if (refresh && currentChatState?.messages) {
        // 过滤出正在发送的临时消息（有clientMsgId且状态为sending）
        const pendingMessages = currentChatState.messages.filter(msg => 
          msg.clientMsgId && msg.sendStatus === 'sending'
        )
        console.log(`[ChatStore] refresh时保留 ${pendingMessages.length} 条正在发送的消息`)
        // 将服务器消息与正在发送的消息合并
        finalMessages = [...messages, ...pendingMessages]
      } else {
        finalMessages = refresh ? messages : [...(currentChatState?.messages || []), ...messages]
      }
      
      set({
        chatMessagesMap: {
          ...get().chatMessagesMap,
          [chatId]: {
            messages: finalMessages,
            isLoading: false,
            hasMore: true, // 总是假设有更多新消息
            hasMoreOlder: result.hasNext, // 是否有更老的消息
            oldestMessageId: messages.length > 0 ? messages[0].id : undefined,
            newestMessageId: finalNewestMessageId,
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
      
      const messages = result.items.map(dto => dto as MessageWithStatus)
      
      set({
        chatMessagesMap: {
          ...get().chatMessagesMap,
          [chatId]: {
            ...currentChatState,
            messages: [...messages, ...currentChatState.messages], // 旧消息放在前面
            isLoading: false,
            hasMoreOlder: result.hasNext,
            oldestMessageId: messages.length > 0 ? messages[0].id : currentChatState.oldestMessageId,
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
  
  addMessage: (chatId: string, message: Omit<MessageWithStatus, 'id'> & { id?: string }) => {
    console.log(`[ChatStore] addMessage 被调用 - chatId: ${chatId}, clientMsgId: ${message.clientMsgId}`)
    
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
    
    console.log(`[ChatStore] 消息添加到聊天 ${chatId}，消息ID: ${newMessage.id}, clientMsgId: ${newMessage.clientMsgId}, 状态: ${newMessage.sendStatus}`)
    
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
    
    console.log(`[ChatStore] 消息添加完成，聊天 ${chatId} 现有 ${currentChatState.messages.length + 1} 条消息`)
  },

  updateMessageSendStatus: (chatId: string, messageId: string, status: 'sending' | 'sent' | 'failed') => {
    const state = get()
    const chatMessages = state.chatMessagesMap[chatId]
    if (!chatMessages) return

    const updatedMessages = chatMessages.messages.map(msg => 
      msg.id === messageId ? { ...msg, sendStatus: status } : msg
    )

    set({
      chatMessagesMap: {
        ...state.chatMessagesMap,
        [chatId]: {
          ...chatMessages,
          messages: updatedMessages
        }
      }
    })
  },

  updateMessageByClientId: (chatId: string, clientMsgId: string, updates: Partial<MessageWithStatus>) => {
    console.log(`[ChatStore] updateMessageByClientId 被调用 - chatId: ${chatId}, clientMsgId: ${clientMsgId}`, updates)
    
    const state = get()
    const chatMessages = state.chatMessagesMap[chatId]
    
    if (!chatMessages) {
      console.warn(`[ChatStore] 找不到聊天 ${chatId} 的消息缓存`)
      return
    }

    console.log(`[ChatStore] 聊天 ${chatId} 共有 ${chatMessages.messages.length} 条消息`)
    
    // 查找目标消息
    const targetMessageIndex = chatMessages.messages.findIndex(msg => msg.clientMsgId === clientMsgId)
    if (targetMessageIndex === -1) {
      console.warn(`[ChatStore] 找不到 clientMsgId 为 ${clientMsgId} 的消息`)
      // 打印所有消息的clientMsgId用于调试
      chatMessages.messages.forEach((msg, index) => {
        console.log(`[ChatStore] 消息 ${index}: id=${msg.id}, clientMsgId=${msg.clientMsgId}, sendStatus=${msg.sendStatus}`)
      })
      return
    }

    console.log(`[ChatStore] 找到目标消息，索引: ${targetMessageIndex}, 当前ID: ${chatMessages.messages[targetMessageIndex].id}, 状态: ${chatMessages.messages[targetMessageIndex].sendStatus}`)

    const updatedMessages = chatMessages.messages.map(msg => 
      msg.clientMsgId === clientMsgId ? { ...msg, ...updates } : msg
    )

    set({
      chatMessagesMap: {
        ...state.chatMessagesMap,
        [chatId]: {
          ...chatMessages,
          messages: updatedMessages
        }
      }
    })
    
    console.log(`[ChatStore] 消息更新完成`)
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

  markChatAsRead: async (chatId: string, force: boolean = false) => {
    const state = get()
    
    // 查找对应的聊天用户
    const chatUser = state.chatUsers.find(user => user.id === chatId)
    if (!chatUser) {
      console.warn(`[ChatStore] 找不到聊天 ${chatId}，无法标记已读`)
      return
    }

    // 如果不是强制模式且没有未读消息，则跳过
    if (!force && chatUser.unreadCount === 0) {
      console.log(`[ChatStore] 聊天 ${chatId} 没有未读消息，跳过标记已读。未读数量: ${chatUser.unreadCount}`)
      return
    }

    console.log(`[ChatStore] 开始标记聊天 ${chatId} 为已读，当前未读数量: ${chatUser.unreadCount}，强制模式: ${force}`)

    // 优先从聊天用户信息中获取最新消息ID
    let latestMessageId = chatUser.lastMessageId
    
    // 如果聊天用户信息中没有最新消息ID，再从消息缓存中获取
    if (!latestMessageId) {
      console.log(`[ChatStore] 聊天用户信息中没有最新消息ID，从消息缓存中获取`)
      
      const chatMessagesState = state.chatMessagesMap[chatId]
      
      // 如果还没有消息数据，先加载消息
      if (!chatMessagesState || !chatMessagesState.messages || chatMessagesState.messages.length === 0) {
        console.log(`[ChatStore] 聊天 ${chatId} 还没有消息数据，先加载消息`)
        try {
          await get().loadChatMessages(chatId, true)
        } catch (error) {
          console.error(`[ChatStore] 加载消息失败:`, error)
          return
        }
        
        const updatedState = get()
        const updatedChatMessagesState = updatedState.chatMessagesMap[chatId]
        if (!updatedChatMessagesState || !updatedChatMessagesState.messages || updatedChatMessagesState.messages.length === 0) {
          console.warn(`[ChatStore] 加载消息后仍然没有消息数据，无法标记已读`)
          return
        }
        
        latestMessageId = updatedChatMessagesState.newestMessageId || updatedChatMessagesState.messages[updatedChatMessagesState.messages.length - 1]?.id
      } else {
        latestMessageId = chatMessagesState.newestMessageId || chatMessagesState.messages[chatMessagesState.messages.length - 1]?.id
      }
    } else {
      console.log(`[ChatStore] 从聊天用户信息中获取到最新消息ID: ${latestMessageId}`)
    }
    
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

  removeChatUser: (chatId: string) => {
    const state = get()
    const updatedChatUsers = state.chatUsers.filter(user => user.id !== chatId)
    
    // 如果被删除的聊天是当前聊天，清空当前聊天ID
    const currentChatId = state.currentChatId === chatId ? null : state.currentChatId
    
    // 同时清理该聊天的消息缓存
    const updatedChatMessagesMap = { ...state.chatMessagesMap }
    delete updatedChatMessagesMap[chatId]
    
    set({
      chatUsers: updatedChatUsers,
      currentChatId,
      chatMessagesMap: updatedChatMessagesMap
    })
    
    console.log(`[ChatStore] 已从聊天列表中移除聊天 ${chatId}`)
  },

  addChatLocally: (chatInfo: ChatInfoDTO) => {
    const state = get()
    
    // 检查是否已存在该聊天
    const existingChatIndex = state.chatUsers.findIndex(user => user.id === chatInfo.id)
    
    if (existingChatIndex >= 0) {
      // 如果已存在，更新聊天信息
      const updatedChatUsers = [...state.chatUsers]
      updatedChatUsers[existingChatIndex] = convertChatInfoToUser(chatInfo)
      set({ chatUsers: updatedChatUsers })
      console.log(`[ChatStore] 已更新聊天信息 ${chatInfo.id}`)
    } else {
      // 如果不存在，添加到聊天列表的最前面
      const newChatUser = convertChatInfoToUser(chatInfo)
      const updatedChatUsers = [newChatUser, ...state.chatUsers]
      set({ chatUsers: updatedChatUsers })
      console.log(`[ChatStore] 已本地添加新聊天 ${chatInfo.id}`)
    }
  },

  initializeChatService: async () => {
    try {
      console.log('[ChatStore] 初始化聊天服务...')
      
      // 设置状态变更回调
      chatService.setStatusChangeCallback((retryInfo: RetryInfo) => {
        console.log('[ChatStore] 连接状态更新:', retryInfo)
        
        // 获取之前的连接状态
        const prevStatus = get().connectionStatus
        
        // 更新状态
        set({ 
          retryInfo,
          connectionStatus: retryInfo.status,
          connectionError: retryInfo.error || null
        })
        
        // 如果连接断开（从已连接变为其他状态），标记所有发送中的消息为失败
        if (prevStatus === ConnectionStatus.CONNECTED && 
            retryInfo.status !== ConnectionStatus.CONNECTED) {
          console.log('[ChatStore] 连接断开，标记所有发送中的消息为失败')
          get().markAllSendingMessagesAsFailed()
        }
      })
      
      // 连接WebSocket
      await chatService.initialize()
      
      // 添加MessageDTO处理器
      chatService.addMessageDTOHandler(get().handleWebSocketMessage)
      
      // 添加回执处理器
      chatService.addReceiptHandler(get().handleMessageReceipt)
      
      // 更新连接状态
      const currentRetryInfo = chatService.getRetryInfo()
      const currentStatus = chatService.getConnectionStatus()
      set({ 
        connectionStatus: currentStatus,
        retryInfo: currentRetryInfo
      })
      
      console.log('[ChatStore] 聊天服务初始化完成，状态:', currentStatus)
    } catch (error) {
      console.error('[ChatStore] 初始化聊天服务失败:', error)
      set({ 
        connectionStatus: ConnectionStatus.FAILED,
        connectionError: error instanceof Error ? error.message : '初始化失败'
      })
    }
  },

  sendMessageViaWebSocket: async (chatId: string, content: string) => {
    const clientMsgId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tempMessageId = `temp-${clientMsgId}`
    
    console.log(`[ChatStore] 开始发送消息 - chatId: ${chatId}, clientMsgId: ${clientMsgId}, tempMessageId: ${tempMessageId}`)
    
    // 立即添加到本地消息列表，状态为发送中
    get().addMessage(chatId, {
      id: tempMessageId,
      clientMsgId,
      chatId,
      sender: useUserStore.getState().currentUser ? {
        id: useUserStore.getState().currentUser!.id,
        openId: useUserStore.getState().currentUser!.openId,
        nickName: useUserStore.getState().currentUser!.nickName,
        avatar: useUserStore.getState().currentUser?.avatar
      } : {
        id: 'unknown',
        openId: 'unknown',
        nickName: '我',
        avatar: undefined
      },
      meta: {
        type: 'TEXT',
        content: content,
        media: null
      },
      sentTime: new Date().toISOString(),
      read: false,
      sendStatus: 'sending'
    })
    
    console.log(`[ChatStore] 消息添加完成，准备发送到WebSocket`)
    
    // 发送消息到WebSocket
    try {
      await chatService.sendMessage({
        chatId,
        content,
        clientMsgId
      })
      
      console.log(`[ChatStore] 消息发送请求完成 - clientMsgId: ${clientMsgId}`)
    } catch (error) {
      console.error(`[ChatStore] 消息发送失败:`, error)
      // 标记消息为发送失败
      get().updateMessageByClientId(chatId, clientMsgId, {
        sendStatus: 'failed'
      })
    }
  },

  handleWebSocketMessage: (messageDTO: MessageDTO) => {
    console.log('[ChatStore] 收到WebSocket消息:', messageDTO)
    get().addRealTimeMessage(messageDTO.chatId, messageDTO)
  },

  handleMessageReceipt: (receipt: import('../utils/websocket').MessageReceipt) => {
    console.log('[ChatStore] 处理消息回执:', receipt)
    
    try {
      // 回执数据结构是 Result<MessageDTO>
      if (receipt.success && receipt.data) {
        const messageData = receipt.data
        const { chatId, clientMsgId, id } = messageData
        
        console.log(`[ChatStore] 回执数据解析 - chatId: ${chatId}, clientMsgId: ${clientMsgId}, serverId: ${id}`)
        
        if (chatId && clientMsgId) {
          const state = get()
          const chatMessages = state.chatMessagesMap[chatId]
          
          console.log(`[ChatStore] 查找聊天 ${chatId} 的消息缓存:`, chatMessages ? `找到，包含 ${chatMessages.messages.length} 条消息` : '未找到')
          
          if (chatMessages) {
            const targetMessage = chatMessages.messages.find(msg => msg.clientMsgId === clientMsgId)
            
            if (targetMessage) {
              console.log(`[ChatStore] 找到对应消息，clientMsgId: ${clientMsgId} -> serverId: ${id}`)
              
              // 更新消息为发送成功状态，并使用服务器返回的真实ID
              get().updateMessageByClientId(chatId, clientMsgId, {
                id: id, // 使用服务器返回的真实ID
                sendStatus: 'sent',
                sentTime: messageData.sentTime
              })
              
              console.log(`[ChatStore] 消息回执处理完成`)
            } else {
              console.warn(`[ChatStore] 找不到对应的消息，clientMsgId: ${clientMsgId}`)
            }
          } else {
            console.warn(`[ChatStore] 找不到聊天 ${chatId} 的消息缓存`)
          }
        } else {
          console.warn(`[ChatStore] 回执数据不完整:`, { chatId, clientMsgId, id })
        }
      } else {
        console.warn('[ChatStore] 回执失败:', receipt)
      }
    } catch (error) {
      console.error('[ChatStore] 处理消息回执时发生错误:', error)
    }
  },

  addRealTimeMessage: (chatId: string, messageDTO: MessageDTO) => {
    console.log(`[ChatStore] 添加实时消息到聊天 ${chatId}:`, messageDTO)
    
    const state = get()
    const currentChatState = state.chatMessagesMap[chatId]
    
    // 检查消息是否已存在（避免重复添加）
    if (currentChatState) {
      const existingMessage = currentChatState.messages.find(msg => msg.id === messageDTO.id)
      if (existingMessage) {
        console.log(`[ChatStore] 消息 ${messageDTO.id} 已存在，跳过添加`)
        return
      }
    }
    
    // 添加消息到当前聊天
    get().addMessage(chatId, messageDTO)
    
    // 更新聊天用户信息
    const chatUser = state.chatUsers.find(user => user.id === chatId)
    if (chatUser) {
      // 检查是否是自己发送的消息
      const isMyMessage = isMessageFromMe(messageDTO)
      const shouldIncreaseUnread = !isMyMessage && state.currentChatId !== chatId
      
      console.log(`[ChatStore] 更新聊天用户信息 - 聊天ID: ${chatId}, 是否增加未读: ${shouldIncreaseUnread}`)
      
      // 更新聊天信息
      const updatedChatUser = {
        ...chatUser,
        lastMessage: messageDTO.meta.content,
        lastMessageTime: new Date(messageDTO.sentTime),
        unreadCount: shouldIncreaseUnread ? chatUser.unreadCount + 1 : chatUser.unreadCount,
        lastMessageId: messageDTO.id // 更新最新消息ID
      }
      
      // 更新聊天用户列表
      const updatedChatUsers = state.chatUsers.map(user => 
        user.id === chatId ? updatedChatUser : user
      )
      
      // 将更新的聊天移到列表顶部
      const filteredChatUsers = updatedChatUsers.filter(user => user.id !== chatId)
      const reorderedChatUsers = [updatedChatUser, ...filteredChatUsers]
      
      set({ chatUsers: reorderedChatUsers })
    }
  },

  setConnectionStatus: (status: ConnectionStatus, error?: string) => {
    set({ 
      connectionStatus: status,
      connectionError: error || null
    })
  },

  loadChatList: async (refresh = false) => {
    const state = get()
    
    // 如果正在加载且不是刷新，则跳过
    if (state.isLoading && !refresh) return
    
    try {
      set({ isLoading: true })
      
      const result = await chatService.getChatList(
        refresh ? undefined : state.lastChatId,
        20
      )
      
      const newChatUsers = result.items.map(convertChatInfoToUser)
      
      set({
        chatUsers: refresh ? newChatUsers : [...state.chatUsers, ...newChatUsers],
        hasMoreChats: result.hasNext,
        lastChatId: result.items.length > 0 ? result.items[result.items.length - 1].id : state.lastChatId,
        isLoading: false
      })
      
    } catch (error) {
      console.error('加载聊天列表失败:', error)
      set({ isLoading: false })
    }
  },

  loadMoreChats: async () => {
    const state = get()
    if (!state.hasMoreChats || state.isLoading) return
    
    await get().loadChatList(false)
  },

  resetConnection: async () => {
    try {
      await chatService.reconnect()
    } catch (error) {
      console.error('重连失败:', error)
    }
  },

  updateRetryInfo: (retryInfo: RetryInfo) => {
    set({ retryInfo })
  },

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
        return `重连中... (${state.retryInfo.currentAttempt}/${state.retryInfo.maxAttempts})`
      case ConnectionStatus.FAILED:
        return '连接失败'
      case ConnectionStatus.DISCONNECTED:
        return '未连接'
      default:
        return '未知状态'
    }
  },

  markAllSendingMessagesAsFailed: () => {
    const state = get()
    const updatedChatMessagesMap = { ...state.chatMessagesMap }
    
    Object.keys(updatedChatMessagesMap).forEach(chatId => {
      const chatState = updatedChatMessagesMap[chatId]
      if (chatState) {
        const updatedMessages = chatState.messages.map(msg => 
          msg.sendStatus === 'sending' ? { ...msg, sendStatus: 'failed' as const } : msg
        )
        
        updatedChatMessagesMap[chatId] = {
          ...chatState,
          messages: updatedMessages
        }
      }
    })
    
    set({ chatMessagesMap: updatedChatMessagesMap })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  }
}))