import { create } from 'zustand'

export interface Message {
  id: string
  content: string
  sender: 'me' | 'other'
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

export interface ChatStore {
  currentChatId: string | null
  chatUsers: ChatUser[]
  messages: Record<string, Message[]>
  setCurrentChat: (chatId: string) => void
  addMessage: (chatId: string, message: Omit<Message, 'id'>) => void
  getChatMessages: (chatId: string) => Message[]
}

// Mock 数据
const mockUsers: ChatUser[] = [
  {
    id: 'user-zhang',
    name: '张三',
    avatar: '',
    lastMessage: '你好，最近怎么样？',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    unreadCount: 2,
    online: true,
  },
  {
    id: 'user-li',
    name: '李四',
    avatar: '',
    lastMessage: '今天天气不错啊',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    unreadCount: 0,
    online: false,
  },
  {
    id: 'user-wang',
    name: '王五',
    avatar: '',
    lastMessage: '明天见面聊',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4小时前
    unreadCount: 1,
    online: true,
  },
  {
    id: 'user-zhao',
    name: '赵六',
    avatar: '',
    lastMessage: '好的，没问题',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1天前
    unreadCount: 0,
    online: false,
  },
  {
    id: 'user-chen',
    name: '陈七',
    avatar: '',
    lastMessage: '周末一起看电影吧',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6小时前
    unreadCount: 3,
    online: true,
  },
  {
    id: 'user-wu',
    name: '吴八',
    avatar: '',
    lastMessage: '项目进展如何？',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8小时前
    unreadCount: 0,
    online: false,
  },
  {
    id: 'user-zhou',
    name: '周九',
    avatar: '',
    lastMessage: '晚上有空吗？',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12小时前
    unreadCount: 1,
    online: true,
  },
  {
    id: 'user-feng',
    name: '冯十',
    avatar: '',
    lastMessage: '收到，谢谢！',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18小时前
    unreadCount: 0,
    online: false,
  },
]

const mockMessages: Record<string, Message[]> = {
  'user-zhang': [
    {
      id: '1-1',
      content: '你好！最近怎么样？',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      type: 'text',
    },
    {
      id: '1-2',
      content: '还不错，工作挺忙的',
      sender: 'me',
      timestamp: new Date(Date.now() - 1000 * 60 * 50),
      type: 'text',
    },
    {
      id: '1-3',
      content: '是啊，最近项目比较多',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      type: 'text',
    },
    {
      id: '1-4',
      content: '周末有时间出来聚聚吗？',
      sender: 'me',
      timestamp: new Date(Date.now() - 1000 * 60 * 40),
      type: 'text',
    },
    {
      id: '1-5',
      content: '好啊，我们去那家新开的餐厅试试',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: 'text',
    },
  ],
  'user-li': [
    {
      id: '2-1',
      content: '今天天气真不错',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      type: 'text',
    },
    {
      id: '2-2',
      content: '是的，很适合出去走走',
      sender: 'me',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      type: 'text',
    },
    {
      id: '2-3',
      content: '要不我们去公园散步？',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: 'text',
    },
  ],
  'user-wang': [
    {
      id: '3-1',
      content: '明天的会议准备好了吗？',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      type: 'text',
    },
    {
      id: '3-2',
      content: '准备好了，PPT已经做完了',
      sender: 'me',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.5),
      type: 'text',
    },
    {
      id: '3-3',
      content: '那就好，明天见面聊',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      type: 'text',
    },
  ],
  'user-zhao': [
    {
      id: '4-1',
      content: '文件发你了，记得查收',
      sender: 'other',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25),
      type: 'text',
    },
    {
      id: '4-2',
      content: '好的，没问题',
      sender: 'me',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: 'text',
    },
  ],
}

export const useChatStore = create<ChatStore>((set, get) => ({
  currentChatId: null,
  chatUsers: mockUsers,
  messages: mockMessages,
  
  setCurrentChat: (chatId: string) => {
    set({ currentChatId: chatId })
  },
  
  addMessage: (chatId: string, message: Omit<Message, 'id'>) => {
    const messages = get().messages
    const chatMessages = messages[chatId] || []
    const newMessage = {
      ...message,
      id: `${chatId}-${Date.now()}`,
    }
    
    set({
      messages: {
        ...messages,
        [chatId]: [...chatMessages, newMessage],
      },
    })
  },
  
  getChatMessages: (chatId: string) => {
    return get().messages[chatId] || []
  },
})) 