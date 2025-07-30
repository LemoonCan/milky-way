import React from 'react'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'
import { useChatStore } from '@/store/chat'
import styles from '../../css/App.module.css'

export const ChatPage: React.FC = () => {
  const { chats, currentChatId, setCurrentChat } = useChatStore()
  const currentChat = chats.find(chat => chat.id === currentChatId) || null
  
  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId)
  }

  return (
    <div className={styles.mainContent}>
      <ChatList 
        onSelectChat={handleSelectChat}
        selectedChatId={currentChatId}
      />
      <ChatWindow currentChat={currentChat} />
    </div>
  )
} 