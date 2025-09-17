import { create } from 'zustand'
import { chatService, type ChatInfoDTO, type MessageDTO } from '../services/chat'
import { type ClientMessageDTO,type CreateGroupChatRequest } from '../services/chat'
import { useUserStore } from './user'
import { handleAndShowError } from '../lib/globalErrorHandler'

// 工具函数：检查聊天是否有消息数据
const hasChatMessages = (chatState?: ChatMessagesState): boolean => {
  return !!(chatState?.messages && chatState.messages.length > 0)
}

// 工具函数：安全的聊天列表合并，避免重复
const safeMergeChats = (existingChats: ChatInfoDTO[], newChats: ChatInfoDTO[]): ChatInfoDTO[] => {
  const existingIds = new Set(existingChats.map(chat => chat.id))
  const uniqueNewChats = newChats.filter(chat => !existingIds.has(chat.id))
  return [...existingChats, ...uniqueNewChats]
}

// 判断消息是否是自己发送的
export const isMessageFromMe = (message: MessageDTO | ClientMessageDTO): boolean => {
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

// 聊天消息状态接口
export interface ChatMessagesState {
  messages: ClientMessageDTO[]
  isLoading: boolean
  hasMoreOlder: boolean
  oldestMessageId?: string
  newestMessageId?: string
}

export interface ChatStore {
  currentChatId: string | null
  chats: ChatInfoDTO[]
  chatMessagesMap: Record<string, ChatMessagesState>
  isLoading: boolean
  hasMoreChats: boolean
  lastMessageId?: string
  pendingFriendUserId: string | null // 待处理的好友用户ID
  setCurrentChat: (chatId: string | null) => Promise<void>
  loadChatMessages: (chatId: string) => Promise<void>
  loadMoreOlderMessages: (chatId: string) => Promise<void>
  addMessage: (message: ClientMessageDTO) => void
  getChatMessages: (chatId: string) => ClientMessageDTO[]
  markChatAsRead: (chatId: string) => Promise<void>
  removeChat: (chatId: string) => void
  addChatLocally: (chatInfo: ChatInfoDTO) => void
  loadChatList: (lastMessageId?: string) => Promise<void>
  loadMoreChats: () => Promise<void>
  createGroupChat: (request: CreateGroupChatRequest) => Promise<string>
  moveChatToTop: (chatId: string, messageDTO: MessageDTO, incrementUnreadCount?: boolean) => void
  ensureFriendChatAndNavigate: (friendUserId: string) => Promise<string>
  setPendingFriendUserId: (friendUserId: string | null) => void // 设置待处理的好友用户ID
}

export const useChatStore = create<ChatStore>((set, get) => ({
    currentChatId: null,
    chats: [],
    chatMessagesMap: {},
    isLoading: false,
    hasMoreChats: true,
    lastMessageId: undefined,
    pendingFriendUserId: null,
  
  setCurrentChat: async (chatId: string | null) => {
    // 如果传入空字符串或null，直接清除当前聊天状态
    if (!chatId || chatId.trim() === '') {
      set({ currentChatId: null })
      return
    }
    
    const state = get()
    const existingChatState = state.chatMessagesMap[chatId]
    // 检查是否需要加载消息：没有缓存消息且没有正在发送的消息时才加载
    const needsLoading = !hasChatMessages(existingChatState)
    if (needsLoading) {
      try {
        await get().loadChatMessages(chatId)
      } catch (error) {
        console.error(`[ChatStore] 聊天 ${chatId} 消息加载失败:`, error)
        handleAndShowError(error)
      }
    } else {
      set({ currentChatId: chatId })
    }
  },
  
  loadChatMessages: async (chatId: string) => {
    const state = get()
    const currentChatState = state.chatMessagesMap[chatId]
    
    // 如果正在加载，则跳过
    if (currentChatState?.isLoading) return
    
    try {
      // 更新加载状态
      set({
        currentChatId: chatId,
        chatMessagesMap: {
          ...state.chatMessagesMap,
          [chatId]: {
            ...currentChatState,
            isLoading: true
          }
        }
      })
      
      // 获取消息，默认加载最新的10条消息
      const result = await chatService.getChatMessages({
        chatId,
        pageSize: 10
      })
      
      const messages = result.items.map(dto => dto as ClientMessageDTO)
    
      set({
        chatMessagesMap: {
          ...get().chatMessagesMap,
          [chatId]: {
            messages: messages,
            isLoading: false,
            hasMoreOlder: result.hasNext,
            oldestMessageId: messages.length > 0 ? messages[0].id : undefined,
            newestMessageId: messages.length > 0 ? messages[messages.length - 1].id : undefined
          }
        }
      })
      
    } catch (error) {
      set({
        chatMessagesMap: {
          ...get().chatMessagesMap,
          [chatId]: {
            ...currentChatState,
            isLoading: false
          }
        }
      })
      console.error('加载聊天消息失败:', error)
      handleAndShowError(error)
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
        pageSize: 10
      })
      
      const messages = result.items.map(dto => dto as ClientMessageDTO)
      
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
      set({
        chatMessagesMap: {
          ...get().chatMessagesMap,
          [chatId]: {
            ...currentChatState,
            isLoading: false
          }
        }
      })
      console.error('加载更多旧消息失败:', error)
      handleAndShowError(error)
    }
  },
  
  addMessage: (message: ClientMessageDTO) => {    
    const state = get()
    const currentChatState = state.chatMessagesMap[message.chatId] || {
      messages: [],
      isLoading: false,
      hasMoreOlder: false
    }

    set({
      chatMessagesMap: {
        ...state.chatMessagesMap,
        [message.chatId]: {
          ...currentChatState,
          messages: [...currentChatState.messages, message],
          newestMessageId: message.id
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
    
    // 查找对应的聊天
    const chat = state.chats.find(chat => chat.id === chatId)
    if (!chat) {
      return
    }

    // 如果没有未读消息，则跳过
    if (chat.unreadCount === 0) {
      return
    }


    const latestMessageId = chat.lastMessageId
    
    if (!latestMessageId) {
      return
    }

    try {
      await chatService.markMessagesAsRead({
        chatId,
        messageId: latestMessageId
      })

      // 标记成功后，更新本地状态：将该聊天的未读数量设为0
      const currentState = get()
      const updatedChats = currentState.chats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            unreadCount: 0
          }
        }
        return chat
      })

      set({
        chats: updatedChats
      })
    } catch (error) {
      console.error(`[ChatStore] 标记聊天 ${chatId} 消息已读失败:`, error)
      handleAndShowError(error)
    }
  },

  removeChat: (chatId: string) => {
    const state = get()
    const updatedChats = state.chats.filter(chat => chat.id !== chatId)
    
    // 如果被删除的聊天是当前聊天，清空当前聊天ID
    const currentChatId = state.currentChatId === chatId ? null : state.currentChatId
    
    // 同时清理该聊天的消息缓存
    const updatedChatMessagesMap = { ...state.chatMessagesMap }
    delete updatedChatMessagesMap[chatId]
    
    set({
      chats: updatedChats,
      currentChatId,
      chatMessagesMap: updatedChatMessagesMap
    })
    
  },

  addChatLocally: (chatInfo: ChatInfoDTO) => {
    const state = get()
    // 检查是否已存在该聊天
    const existingChatIndex = state.chats.findIndex(chat => chat.id === chatInfo.id)
    
    if (existingChatIndex >= 0) {
      // 如果已存在，更新聊天信息
      const updatedChats = [...state.chats]
      updatedChats[existingChatIndex] = chatInfo
      set({ chats: updatedChats })
    } else {
      // 如果不存在，添加到聊天列表的最前面
      const updatedChats = [chatInfo, ...state.chats]
      set({ chats: updatedChats })
    }
  },


  loadChatList: async (lastMessageId?: string) => {
    const state = get()
    
    // 如果正在加载且不是刷新，则跳过
    if (state.isLoading) return
    
    try {
      set({ isLoading: true })
      
      const result = await chatService.getChatList(
        lastMessageId,
        10
      )
      const newChats = result.items
      
      set({
        chats: lastMessageId ? safeMergeChats(state.chats, newChats) : newChats,
        hasMoreChats: result.hasNext,
        isLoading: false
      })
      
    } catch (error) {
      console.error('加载聊天列表失败:', error)
      handleAndShowError(error)
      set({ isLoading: false })
    }
  },

  loadMoreChats: async () => {
    const state = get()
    if (!state.hasMoreChats || state.isLoading) return
    
    const chats = state.chats;
    const lastMessageId = chats[chats.length - 1].lastMessageId;
    await get().loadChatList(lastMessageId)
  },
  

  createGroupChat: async (request: CreateGroupChatRequest) => {
    const result = await chatService.createGroupChat(request)
    get().addChatLocally(result)
    return result.id
  },

  moveChatToTop: (chatId: string, messageDTO: MessageDTO, incrementUnreadCount?: boolean) => {
    const state = get()
    const chat = state.chats.find(chat => chat.id === chatId)
    
    if (!chat) {
      return
    }
    
    // 从 MessageDTO 中提取更新信息
    const updatedChat = {
      ...chat,
      lastMessage: messageDTO.meta.content || '',
      lastMessageTime: messageDTO.sentTime,
      lastMessageId: messageDTO.id,
      // 根据参数决定是否增加未读数量
      unreadCount: incrementUnreadCount ? chat.unreadCount + 1 : chat.unreadCount
    }
    
    // 将更新的聊天移到列表顶部
    const otherChats = state.chats.filter(c => c.id !== chatId)
    const reorderedChats = [updatedChat, ...otherChats]
    
    set({ chats: reorderedChats })
  },

  ensureFriendChatAndNavigate: async (friendUserId: string) => {
    try {      
      // 调用接口获取好友聊天信息
      const chatInfo = await chatService.getFriendChat(friendUserId)      
      // 验证返回的聊天信息
      if (!chatInfo || !chatInfo.id) {
        throw new Error('聊天信息无效')
      }
      
      // 获取当前状态（聊天页面应该已经加载了聊天列表）
      const currentState = get()
      
      // 检查缓存的聊天列表中是否包含相应聊天
      const existingChatIndex = currentState.chats.findIndex(chat => chat.id === chatInfo.id)
      
      if (existingChatIndex >= 0) {
        // 如果存在，将该聊天置顶
        const existingChat = currentState.chats[existingChatIndex]
        const otherChats = currentState.chats.filter(chat => chat.id !== chatInfo.id)
        const reorderedChats = [existingChat, ...otherChats] 
        set({ chats: reorderedChats })
      } else {
        // 如果不存在，添加到聊天列表的最前面
        const updatedChats = [chatInfo, ...currentState.chats]   
        set({ chats: updatedChats })
      }
      // 返回聊天ID，用于后续导航
      return chatInfo.id
    } catch (error) {
      console.error('[ChatStore] 获取好友聊天信息失败:', error)
      handleAndShowError(error)
      throw error
    }
  },

  setPendingFriendUserId: (friendUserId: string | null) => {
    set({ pendingFriendUserId: friendUserId })
  }
}))