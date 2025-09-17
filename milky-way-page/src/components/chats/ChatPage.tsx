import React, { useState, useEffect } from 'react'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'
import { useChatStore } from '../../store/chat'
import { useIsMobile } from '../../hooks/useIsMobile'
import styles from '../../css/App.module.css'
import chatStyles from '../../css/chats/ChatPage.module.css'

export const ChatPage: React.FC = () => {
  const isMobile = useIsMobile()
  const { currentChatId, setCurrentChat } = useChatStore()
  const [showChatWindow, setShowChatWindow] = useState(false)
  
  // 移动端：当选中聊天时显示聊天窗口
  useEffect(() => {
    if (isMobile && currentChatId) {
      setShowChatWindow(true)
    } else if (isMobile && !currentChatId) {
      setShowChatWindow(false)
    }
  }, [isMobile, currentChatId])
  
  // 移动端返回聊天列表
  const handleBackToList = () => {
    setCurrentChat(null)
    setShowChatWindow(false)
  }
  
  
  // 桌面端布局（保持原有逻辑）
  if (!isMobile) {
    return (
      <div className={styles.mainContent}>
        <ChatList/>
        <ChatWindow/>
      </div>
    )
  }
  
  // 移动端布局
  return (
    <div className={styles.mainContent}>
      {!showChatWindow ? (
        // 显示聊天列表
        <ChatList />
      ) : (
        // 显示聊天窗口
        <div className={chatStyles.mobileChat}>
          <ChatWindow onBack={handleBackToList} />
        </div>
      )}
    </div>
  )
} 