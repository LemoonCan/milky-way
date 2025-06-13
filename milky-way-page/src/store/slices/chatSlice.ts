import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  groupId?: string;
  content: string;
  type: 'text' | 'image' | 'emoji';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface Chat {
  id: string;
  type: 'single' | 'group';
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isDoNotDisturb: boolean;
}

interface ChatState {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  activeChat: string | null;
  isLoading: boolean;
}

const initialState: ChatState = {
  chats: [],
  messages: {},
  activeChat: null,
  isLoading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const chatId = message.groupId || message.recipientId || '';

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);
    },
    setActiveChat: (state, action: PayloadAction<string | null>) => {
      state.activeChat = action.payload;
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ messageId: string; status: Message['status'] }>
    ) => {
      const { messageId, status } = action.payload;
      Object.values(state.messages).forEach((chatMessages) => {
        const message = chatMessages.find((msg) => msg.id === messageId);
        if (message) {
          message.status = status;
        }
      });
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
  },
});

export const { addMessage, setActiveChat, updateMessageStatus, setChats } =
  chatSlice.actions;
export default chatSlice.reducer;
