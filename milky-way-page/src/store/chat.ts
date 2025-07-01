import { create } from 'zustand'
import { chatService, type ChatInfoDTO, type Slices, type MessageDTO } from '../services/chat'
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

// 移除 Message 接口，直接使用 MessageDTO
// 添加前端特有的扩展字段
export interface MessageWithStatus extends MessageDTO {
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
  lastMessageId?: string // 添加最新消息ID
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
  setCurrentChat: (chatId: string) => Promise<void>
  loadChatMessages: (chatId: string, refresh?: boolean) => Promise<void>
  loadMoreOlderMessages: (chatId: string) => Promise<void>
  addMessage: (chatId: string, message: Omit<MessageWithStatus, 'id'> & { id?: string }) => void
  updateMessageSendStatus: (chatId: string, messageId: string, status: 'sending' | 'sent' | 'failed') => void
  updateMessageByClientId: (chatId: string, clientMsgId: string, updates: Partial<MessageWithStatus>) => void
  clearMessageSendStatus: (chatId: string, messageId: string) => void
  getChatMessages: (chatId: string) => MessageWithStatus[]
  markChatAsRead: (chatId: string, force?: boolean) => Promise<void>
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
  
  setCurrentChat: async (chatId: string) => {
    console.log(`[ChatStore] setCurrentChat 被调用，chatId: ${chatId}`)
    set({ currentChatId: chatId })
    
    const state = get()
    const chatUser = state.chatUsers.find(user => user.id === chatId)
    console.log(`[ChatStore] 找到聊天用户:`, chatUser ? `${chatUser.name}, 未读数量: ${chatUser.unreadCount}` : '未找到')
    
    // 当切换聊天时，如果该聊天还没有加载过消息，则加载最新消息
    const existingChatState = state.chatMessagesMap[chatId]
    
    if (!hasChatMessages(existingChatState)) {
      console.log(`[ChatStore] 聊天 ${chatId} 没有消息数据，开始加载消息`)
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
      
      set({
        chatMessagesMap: {
          ...get().chatMessagesMap,
          [chatId]: {
            messages: refresh ? messages : [...(currentChatState?.messages || []), ...messages],
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
    const state = get()
    const chatMessages = state.chatMessagesMap[chatId]
    
    if (!chatMessages) return

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
      content,
      type: 'TEXT',
      sentTime: new Date().toISOString(),
      read: false,
      sendStatus: 'sending'
    })

    // 发送消息的内部函数，支持重试和超时
    const trySendMessage = async (attempt: number = 1): Promise<void> => {
      try {
        // 检查连接状态
        const currentStatus = get().connectionStatus
        const isConnected = get().isConnected()
        
        if (!isConnected) {
          // 如果状态是失败或断开连接，直接标记为失败，不进行重试
          if (currentStatus === ConnectionStatus.FAILED || currentStatus === ConnectionStatus.DISCONNECTED) {
            throw new Error('连接已失败，无法发送消息')
          }
          // 如果正在重试中，也不发送消息，避免重复发送
          if (currentStatus === ConnectionStatus.RETRYING) {
            throw new Error('连接重试中，请稍后再试')
          }
          
          throw new Error('WebSocket未连接')
        }
        
        // 创建发送超时Promise
        const sendTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('发送消息超时'))
          }, 10000) // 10秒超时
        })
        
        // 创建发送Promise
        const sendPromise = chatService.sendMessage({
          chatId,
          content,
          messageType: 'TEXT',
          clientMsgId
        })
        
        // 使用Promise.race来实现超时
        await Promise.race([sendPromise, sendTimeout])
        
        // 设置回执超时：如果15秒内没有收到回执，也认为发送失败
        setTimeout(() => {
          const state = get()
          const chatMessages = state.chatMessagesMap[chatId]
          if (chatMessages) {
            const message = chatMessages.messages.find(msg => msg.clientMsgId === clientMsgId)
            if (message && message.sendStatus === 'sending') {
              get().updateMessageByClientId(chatId, clientMsgId, { sendStatus: 'failed' })
            }
          }
        }, 15000) // 15秒回执超时
        
      } catch (error) {
        console.error(`发送消息失败，第${attempt}次尝试:`, error)
        
        // 检查是否是致命错误（不应重试的错误）
        const isFatalError = error instanceof Error && (
          error.message.includes('连接已失败，无法发送消息') ||
          error.message.includes('连接重试中，请稍后再试')
        )
        
        // 如果是致命错误，直接标记为失败，不重试
        if (isFatalError) {
          get().updateMessageByClientId(chatId, clientMsgId, { sendStatus: 'failed' })
          return
        }
        
        // 检查是否是网络相关错误
        const isNetworkError = error instanceof Error && (
          error.message.includes('WebSocket未连接') ||
          error.message.includes('发送消息超时') ||
          error.message.includes('网络') ||
          error.message.includes('连接')
        )
        
        if (attempt < 3 && isNetworkError) {
          // 网络错误且还有重试机会，延迟后重试
          setTimeout(() => {
            trySendMessage(attempt + 1)
          }, 2000 * attempt) // 递增延迟：2秒、4秒
        } else if (attempt < 3) {
          // 非网络错误，立即重试
          setTimeout(() => {
            trySendMessage(attempt + 1)
          }, 500) // 短暂延迟
        } else {
          // 3次都失败了，标记为失败
          get().updateMessageByClientId(chatId, clientMsgId, { sendStatus: 'failed' })
        }
      }
    }

    // 开始发送
    await trySendMessage()
  },

  handleWebSocketMessage: (messageDTO: MessageDTO) => {
    console.log('[ChatStore] 处理WebSocket消息:', messageDTO)
    
    // 群聊广播消息过滤：只处理非当前用户发送的消息
    // 避免自己发送的消息重复显示（群聊会广播给所有成员包括发送者）
    if (isMessageFromMe(messageDTO)) {
      console.log('[ChatStore] 跳过自己发送的广播消息，避免重复显示')
      return
    }
    
    get().addRealTimeMessage(messageDTO.chatId, messageDTO)
  },

  handleMessageReceipt: (receipt: import('../utils/websocket').MessageReceipt) => {
    console.log('[ChatStore] 处理消息回执:', receipt)
    
    try {
      // 回执数据结构是 Result<MessageDTO>
      if (receipt.success && receipt.data) {
        const messageData = receipt.data
        const { chatId, clientMsgId, id } = messageData
        
        if (chatId && clientMsgId) {
          // 更新消息：设置真实的服务器ID和成功状态
          get().updateMessageByClientId(chatId, clientMsgId, {
            id: id,
            sendStatus: 'sent'
          })
          console.log(`[ChatStore] 消息发送成功，clientMsgId: ${clientMsgId}, serverId: ${id}`)
        }
      } else {
        // 回执失败，尝试从错误信息中获取 chatId 和 clientMsgId
        const errorMsg = receipt.msg || '消息发送失败'
        console.error('[ChatStore] 消息发送失败:', errorMsg)
        
        // 如果回执中包含 chatId 和 clientMsgId，更新对应消息状态为失败
        if (receipt.data?.chatId && receipt.data?.clientMsgId) {
          get().updateMessageByClientId(receipt.data.chatId, receipt.data.clientMsgId, {
            sendStatus: 'failed'
          })
        }
      }
    } catch (error) {
      console.error('[ChatStore] 处理消息回执时出错:', error)
    }
  },

  addRealTimeMessage: (chatId: string, messageDTO: MessageDTO) => {
    const state = get()
    
    // 判断当前聊天详情是否打开
    const isChatDetailOpen = state.currentChatId === chatId
    
    // 将MessageDTO转换为Message对象
    const newMessage: MessageWithStatus = messageDTO as MessageWithStatus
    
    // 如果聊天详情打开，则向消息列表中添加消息
    if (isChatDetailOpen) {
      const currentChatState = state.chatMessagesMap[chatId] || {
        messages: [],
        isLoading: false,
        hasMore: true,
        hasMoreOlder: false
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

      // 聊天详情页打开时，自动标记新消息为已读
      setTimeout(() => {
        get().markChatAsRead(chatId, true).catch(error => { // force = true
          console.error(`[ChatStore] 自动标记新消息已读失败:`, error)
        })
      }, 200) // 稍微延迟，确保消息已添加到界面
    } else {
      // 聊天详情页未打开时，只更新现有缓存中的 newestMessageId
      // 不创建新的空缓存条目，节省内存
      const currentChatState = state.chatMessagesMap[chatId]
      if (currentChatState) {
        set({
          chatMessagesMap: {
            ...state.chatMessagesMap,
            [chatId]: {
              ...currentChatState,
              newestMessageId: newMessage.id
            }
          }
        })
      }
      // 注意：如果没有现有缓存，不创建新条目，依赖 ChatUser.lastMessageId
    }

    // 更新聊天列表中的最后消息，并将收到消息的聊天移到顶部
    const chatUsers = state.chatUsers
    const chatUserIndex = chatUsers.findIndex(user => user.id === chatId)
    
    if (chatUserIndex !== -1) {
      const chatUser = chatUsers[chatUserIndex]
      // 只有当聊天详情没有打开时才增加未读数量
      const shouldIncreaseUnread = !isChatDetailOpen
      
      // 更新聊天信息
      const updatedChatUser = {
        ...chatUser,
        lastMessage: messageDTO.content,
        lastMessageTime: new Date(messageDTO.sentTime),
        unreadCount: shouldIncreaseUnread ? chatUser.unreadCount + 1 : chatUser.unreadCount,
        lastMessageId: newMessage.id // 更新最新消息ID
      }
      
      // 创建新的聊天列表：将更新后的聊天项放到第一位，其他保持顺序
      const otherUsers = chatUsers.filter((_, index) => index !== chatUserIndex)
      const updatedUsers = [updatedChatUser, ...otherUsers]
      
      console.log(`[ChatStore] 聊天 ${chatId} 收到消息，移动到列表顶部`)
      set({ chatUsers: updatedUsers })
    } else {
      console.warn(`[ChatStore] 找不到聊天 ${chatId}，无法更新聊天列表`)
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
          console.log('📡 [ChatStore] 重连时连接断开，标记所有发送中的消息为失败')
          get().markAllSendingMessagesAsFailed()
        }
      })
      
      console.log('🔗 [ChatStore] 调用 chatService.reconnect()')
      await chatService.reconnect()
      console.log('✅ [ChatStore] chatService.reconnect() 完成')
      
      // 重新添加MessageDTO处理器
      chatService.addMessageDTOHandler(get().handleWebSocketMessage)
      
      // 重新添加回执处理器
      chatService.addReceiptHandler(get().handleMessageReceipt)
      
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
  },

  // 添加新方法
  markAllSendingMessagesAsFailed: () => {
    const state = get()
    const chatMessagesMap = state.chatMessagesMap
    
    for (const chatId in chatMessagesMap) {
      const chatMessages = chatMessagesMap[chatId]
      
      for (const message of chatMessages.messages) {
        if (message.sendStatus === 'sending') {
          get().updateMessageSendStatus(chatId, message.id, 'failed')
        }
      }
    }
  }
})) 