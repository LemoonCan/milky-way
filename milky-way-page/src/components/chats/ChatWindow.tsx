import React, { useState, useRef } from 'react'

import { ChatInput } from './ChatInput'
import { MessageList } from './MessageList'
import { ChatHeader } from './ChatHeader'

import { useChatStore } from '@/store/chat'
import styles from '../../css/chats/ChatWindow.module.css'

export const ChatWindow: React.FC = () => {
  const [inputValue, setInputValue] = useState('')

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { currentChatId, chats } = useChatStore()
  const currentChat = chats.find(chat => chat.id === currentChatId) || null
  const chatState = useChatStore(s => currentChat ? s.chatMessagesMap[currentChat.id] : undefined)

  if (!currentChat) {
    return (
      <div className={styles.chatWindow}>
      </div>
    )
  }

  return (
    <div className={styles.chatWindow}>
      {/* 聊天头部 */}
      <ChatHeader chat={currentChat} />

      {/* 聊天消息区域 */}
      <MessageList
        chatState={chatState}
        chatId={currentChat.id}
      />

      {/* 输入工具栏 */}
      <ChatInput
        inputValue={inputValue}
        onInputChange={setInputValue}
        uploadingFiles={new Set()}
        textareaRef={textareaRef}
        currentChatId={currentChat?.id || null}
      />
    </div>
  )
} 