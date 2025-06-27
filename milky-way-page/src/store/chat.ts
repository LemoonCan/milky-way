import { create } from 'zustand'
import { chatService, type ChatInfoDTO, type Slices, type MessageDTO, type SimpleUserDTO } from '../services/chat'
import type { WebSocketMessage } from '../utils/websocket'

export interface Message {
  id: string
  content: string
  sender: 'me' | 'other'
  senderInfo?: SimpleUserDTO
  timestamp: Date
  type: 'text' | 'image' | 'file'
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
  isConnected: boolean
  connectionError: string | null
  isLoading: boolean
  hasMoreChats: boolean
  lastChatId?: string
  setCurrentChat: (chatId: string) => void
  // 更新方法签名
  loadChatMessages: (chatId: string, refresh?: boolean) => Promise<void>
  loadMoreOlderMessages: (chatId: string) => Promise<void>
  addMessage: (chatId: string, message: Omit<Message, 'id'>) => void
  getChatMessages: (chatId: string) => Message[]
  initializeChatService: () => Promise<void>
  sendMessageViaWebSocket: (chatId: string, content: string) => Promise<void>
  handleWebSocketMessage: (wsMessage: WebSocketMessage) => void
  addRealTimeMessage: (chatId: string, wsMessage: WebSocketMessage) => void
  setConnectionStatus: (connected: boolean, error?: string) => void
  loadChatList: (refresh?: boolean) => Promise<void>
  loadMoreChats: () => Promise<void>
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
          messageDTO.type === 'FILE' ? 'file' : 'text'
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
  isConnected: false,
  connectionError: null,
  isLoading: false,
  hasMoreChats: true,
  lastChatId: undefined,
  
  setCurrentChat: (chatId: string) => {
    set({ currentChatId: chatId })
    // 当切换聊天时，如果该聊天还没有加载过消息，则加载最新消息
    const state = get()
    if (!state.chatMessagesMap[chatId]) {
      get().loadChatMessages(chatId, true)
    }
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
  
  addMessage: (chatId: string, message: Omit<Message, 'id'>) => {
    const state = get()
    const currentChatState = state.chatMessagesMap[chatId] || {
      messages: [],
      isLoading: false,
      hasMore: true,
      hasMoreOlder: false
    }
    
    const newMessage = {
      ...message,
      id: `${chatId}-${Date.now()}`,
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
  
  getChatMessages: (chatId: string) => {
    const state = get()
    return state.chatMessagesMap[chatId]?.messages || []
  },

  initializeChatService: async () => {
    try {
      set({ connectionError: null })
      await chatService.initialize()
      
      // 添加消息处理器
      chatService.addMessageHandler(get().handleWebSocketMessage)
      
      set({ isConnected: true })
      console.log('聊天服务初始化完成')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '连接失败'
      set({ 
        isConnected: false, 
        connectionError: errorMessage 
      })
      console.error('初始化聊天服务失败:', error)
    }
  },

  sendMessageViaWebSocket: async (chatId: string, content: string) => {
    try {
      if (!get().isConnected) {
        throw new Error('WebSocket未连接')
      }
      
      await chatService.sendMessage({
        chatId,
        content,
        messageType: 'TEXT'
      })
      
      // 立即添加到本地消息列表（发送方视角）
      get().addMessage(chatId, {
        content,
        sender: 'me',
        timestamp: new Date(),
        type: 'text'
      })
      
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  },

  handleWebSocketMessage: (wsMessage: WebSocketMessage) => {
    console.log('处理WebSocket消息:', wsMessage)
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

  setConnectionStatus: (connected: boolean, error?: string) => {
    set({ 
      isConnected: connected, 
      connectionError: error || null 
    })
  },

  loadChatList: async (refresh = false) => {
    const state = get()
    if (state.isLoading) return
    
    try {
      set({ isLoading: true, connectionError: null })
      
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
      console.error('获取聊天列表失败:', error)
    }
  },

  loadMoreChats: async () => {
    const state = get()
    if (!state.hasMoreChats || state.isLoading) return
    
    await get().loadChatList(false)
  }
})) 