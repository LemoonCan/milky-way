import { create } from 'zustand'
import { chatService, type ChatInfoDTO, type MessageDTO } from '../services/chat'
import { type ClientMessageDTO,type CreateGroupChatRequest } from '../services/chat'
import { useUserStore } from './user'
import { handleAndShowError } from '../lib/globalErrorHandler'

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
const hasNewMessagesToLoad = (chatState?: ChatMessagesState, chat?: Chat): boolean => {
  if (!chatState || !chat || !chat.lastMessageId) {
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
  const actualNewestId = chat.lastMessageId
  
  // 如果缓存中没有最新消息ID，或者与实际最新消息ID不同，需要重新加载
  return !cachedNewestId || cachedNewestId !== actualNewestId
}

export interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  online: boolean //仅在单聊时有值
  lastMessageId?: string // 添加最新消息ID
  chatType: 'SINGLE' | 'GROUP' // 添加聊天类型字段
  friendId?: string // 好友ID，仅在单聊时有值
}

// 修改聊天消息状态接口
export interface ChatMessagesState {
  messages: ClientMessageDTO[]
  isLoading: boolean
  hasMoreOlder: boolean
  oldestMessageId?: string
  newestMessageId?: string
  error?: string
}

export interface ChatStore {
  currentChatId: string | null
  chats: Chat[]
  chatMessagesMap: Record<string, ChatMessagesState>
  isLoading: boolean
  hasMoreChats: boolean
  lastMessageId?: string
  error: string | null
  setCurrentChat: (chatId: string) => Promise<void>
  loadChatMessages: (chatId: string, refresh?: boolean) => Promise<void>
  loadMoreOlderMessages: (chatId: string) => Promise<void>
  addMessage: (message: ClientMessageDTO) => void
  getChatMessages: (chatId: string) => ClientMessageDTO[]
  markChatAsRead: (chatId: string, force?: boolean) => Promise<void>
  removeChat: (chatId: string) => void
  addChatLocally: (chatInfo: ChatInfoDTO) => void
  addRealTimeMessage: (chatId: string, messageDTO: MessageDTO) => void
  loadChatList: (lastMessageId?: string) => Promise<void>
  loadMoreChats: () => Promise<void>
  setError: (error: string | null) => void
  createGroupChat: (request: CreateGroupChatRequest) => Promise<string>
}


// Mock messages are now loaded from API

// 移除转换函数，添加工具函数用于组件中的判断
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

// 转换后端 ChatInfoDTO 到前端 Chat 格式
const convertChatInfoToChat = (chatInfo: ChatInfoDTO): Chat => {
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
    lastMessage: chatInfo.lastMessage || '', // 修复类型错误：确保 lastMessage 是 string
    lastMessageTime,
    unreadCount: chatInfo.unreadCount,
    online: chatInfo.online,
    chatType: chatInfo.chatType,
    friendId: chatInfo.friendId, // 添加好友ID字段
    lastMessageId: chatInfo.lastMessageId // 添加最新消息ID字段
  }
}

export const useChatStore = create<ChatStore>((set, get) => ({
    currentChatId: null,
    chats: [],
    chatMessagesMap: {},
    isLoading: false,
    hasMoreChats: true,
    lastMessageId: undefined,
    error: null,
  
  setCurrentChat: async (chatId: string) => {
    console.log(`[ChatStore] setCurrentChat 被调用，chatId: ${chatId}`)
    
    const state = get()
    const chat = state.chats.find(chat => chat.id === chatId)
    console.log(`[ChatStore] 找到聊天:`, chat ? `${chat.name}, 未读数量: ${chat.unreadCount}` : '未找到')
    
    const existingChatState = state.chatMessagesMap[chatId]
    
    // 检查是否需要加载消息
    const needsLoading = !hasChatMessages(existingChatState) || hasNewMessagesToLoad(existingChatState, chat)
    
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
      set({ currentChatId: chatId })
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
        currentChatId: chatId,
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
        pageSize: 10
        // 不传before和after，默认获取最新消息
      })
      
      const messages = result.items.map(dto => dto as ClientMessageDTO)
      
      // 计算最新消息ID：优先使用已存在的 newestMessageId（可能是通过WebSocket更新的）
      const loadedNewestId = messages.length > 0 ? messages[messages.length - 1].id : undefined
      const existingNewestId = currentChatState?.newestMessageId
      
      const finalNewestMessageId = getNewestMessageId(existingNewestId, loadedNewestId)
      
      // 如果是refresh，需要保留正在发送的临时消息
      let finalMessages: ClientMessageDTO[]
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
    
    console.log('loadMoreOlderMessages 被调用')
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
  
  addMessage: (message: ClientMessageDTO) => {
    console.log(`[ChatStore] addMessage 被调用 - chatId: ${message.chatId}, clientMsgId: ${message.clientMsgId}`)
    
    const state = get()
    const currentChatState = state.chatMessagesMap[message.chatId] || {
      messages: [],
      isLoading: false,
      hasMoreOlder: false
    }
    
    console.log(`[ChatStore] 消息添加到聊天 ${message.chatId}，消息ID: ${message.id}, clientMsgId: ${message.clientMsgId}, 状态: ${message.sendStatus}`)
    
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
    
    console.log(`[ChatStore] 消息添加完成，聊天 ${message.chatId} 现有 ${currentChatState.messages.length + 1} 条消息`)
  },


  
  getChatMessages: (chatId: string) => {
    const state = get()
    return state.chatMessagesMap[chatId]?.messages || []
  },

  markChatAsRead: async (chatId: string, force: boolean = false) => {
    const state = get()
    
    // 查找对应的聊天
    const chat = state.chats.find(chat => chat.id === chatId)
    if (!chat) {
      console.warn(`[ChatStore] 找不到聊天 ${chatId}，无法标记已读`)
      return
    }

    // 如果不是强制模式且没有未读消息，则跳过
    if (!force && chat.unreadCount === 0) {
      console.log(`[ChatStore] 聊天 ${chatId} 没有未读消息，跳过标记已读。未读数量: ${chat.unreadCount}`)
      return
    }

    console.log(`[ChatStore] 开始标记聊天 ${chatId} 为已读，当前未读数量: ${chat.unreadCount}，强制模式: ${force}`)

    // 优先从聊天信息中获取最新消息ID
    let latestMessageId = chat.lastMessageId
    
    // 如果聊天信息中没有最新消息ID，再从消息缓存中获取
    if (!latestMessageId) {
      console.log(`[ChatStore] 聊天信息中没有最新消息ID，从消息缓存中获取`)
      
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
      console.log(`[ChatStore] 从聊天信息中获取到最新消息ID: ${latestMessageId}`)
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

      console.log(`[ChatStore] 成功标记聊天 ${chatId} 的消息已读`)
    } catch (error) {
      console.error(`[ChatStore] 标记聊天 ${chatId} 消息已读失败:`, error)
      // 标记失败时不更新本地状态
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
    
    console.log(`[ChatStore] 已从聊天列表中移除聊天 ${chatId}`)
  },

  addChatLocally: (chatInfo: ChatInfoDTO) => {
    const state = get()
    
    // 检查是否已存在该聊天
    const existingChatIndex = state.chats.findIndex(chat => chat.id === chatInfo.id)
    
    if (existingChatIndex >= 0) {
      // 如果已存在，更新聊天信息
      const updatedChats = [...state.chats]
      updatedChats[existingChatIndex] = convertChatInfoToChat(chatInfo)
      set({ chats: updatedChats })
      console.log(`[ChatStore] 已更新聊天信息 ${chatInfo.id}`)
    } else {
      // 如果不存在，添加到聊天列表的最前面
      const newChat = convertChatInfoToChat(chatInfo)
      const updatedChats = [newChat, ...state.chats]
      set({ chats: updatedChats })
      console.log(`[ChatStore] 已本地添加新聊天 ${chatInfo.id}`)
    }
  },

  addRealTimeMessage: (chatId: string, messageDTO: MessageDTO) => {
    console.log(`[ChatStore] 添加实时消息到聊天 ${chatId}:`, messageDTO)
    
    const state = get()
    const currentChatState = state.chatMessagesMap[chatId]
    const chat = state.chats.find(chat => chat.id === chatId)
    
    // 在群聊中，如果收到的是自己发送的消息，直接跳过所有处理（避免重复）
    // 因为消息回执已经处理了聊天列表的更新
    // 单聊仍然需要通过addRealTimeMessage处理自己的消息
    const isMyMessage = isMessageFromMe(messageDTO)
    if (chat && chat.chatType === 'GROUP' && isMyMessage) {
      console.log(`[ChatStore] 群聊中收到自己发送的消息 ${messageDTO.id}，跳过处理避免重复`)
      return
    }
    
    // 检查消息是否已存在（避免重复添加）
    if (currentChatState) {
      const existingMessage = currentChatState.messages.find(msg => {
        // 通过消息ID匹配
        if (msg.id === messageDTO.id) {
          return true
        }
        // 通过clientMsgId匹配（处理回执和推送时序问题）
        if (messageDTO.clientMsgId && msg.clientMsgId === messageDTO.clientMsgId) {
          return true
        }
        return false
      })
      
      if (existingMessage) {
        return
      }
    }
    
    // 检查消息列表是否已缓存（不为空）
    const hasMessageCache = currentChatState && currentChatState.messages && currentChatState.messages.length > 0
    
    if (hasMessageCache) {
      // 如果已有消息缓存，正常添加消息到列表
      console.log(`[ChatStore] 聊天 ${chatId} 已有消息缓存，添加新消息到列表`)
      get().addMessage(messageDTO)
    } else {
      // 如果没有消息缓存，只更新聊天项信息，不添加消息到列表
      // 这样用户打开聊天时会触发完整的历史消息加载
      console.log(`[ChatStore] 聊天 ${chatId} 无消息缓存，只更新聊天项信息，不添加消息到列表`)
    }
    
    // 更新聊天信息
    if (chat) {
      // 检查是否是自己发送的消息（在前面已经做过了，这里直接使用）
      const shouldIncreaseUnread = !isMyMessage && state.currentChatId !== chatId
      
      console.log(`[ChatStore] 更新聊天信息 - 聊天ID: ${chatId}, 是否增加未读: ${shouldIncreaseUnread}`)
      
      // 更新聊天信息
      const updatedChat = {
        ...chat,
        lastMessage: messageDTO.meta.content || '', // 修复类型错误：确保 lastMessage 是 string
        lastMessageTime: new Date(messageDTO.sentTime),
        unreadCount: shouldIncreaseUnread ? chat.unreadCount + 1 : chat.unreadCount,
        lastMessageId: messageDTO.id // 更新最新消息ID
      }
      
      // 更新聊天列表
      const updatedChats = state.chats.map(chat => 
        chat.id === chatId ? updatedChat : chat
      )
      
      // 将更新的聊天移到列表顶部
      const filteredChats = updatedChats.filter(chat => chat.id !== chatId)
      const reorderedChats = [updatedChat, ...filteredChats]
      
      set({ chats: reorderedChats })
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
      
      const newChats = result.items.map(convertChatInfoToChat)
      
      set({
        chats:  lastMessageId ? [...state.chats, ...newChats] : newChats,
        hasMoreChats: result.hasNext,
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
    
    const chats = state.chats;
    const lastMessageId = chats[chats.length - 1].lastMessageId;
    await get().loadChatList(lastMessageId)
  },

  setError: (error: string | null) => {
    // 使用全局错误处理
    if (error) {
      handleAndShowError(error)
    }
  },

  createGroupChat: async (request: CreateGroupChatRequest) => {
    const result = await chatService.createGroupChat(request)
    console.log('创建群聊成功:', result)
    get().addChatLocally(result)
    return result.id
  }
}))