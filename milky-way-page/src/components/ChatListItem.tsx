import React from 'react'
import { Avatar } from './Avatar'
import type { ChatUser } from '@/store/chat'
import styles from '../css/ChatListItem.module.css'

interface ChatListItemProps {
  user: ChatUser
  isActive: boolean
  onClick: () => void
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  user,
  isActive,
  onClick,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}小时前`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}天前`
    }
  }

  return (
    <div
      className={`${styles.chatItem} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.avatarContainer}>
        <Avatar 
          size={48}
          userId={user.id}
          className={styles.avatar}
        />
        {user.online && (
          <div className={styles.onlineIndicator}></div>
        )}
        {user.unreadCount > 0 && (
          <div className={styles.unreadBadge}>
            {user.unreadCount > 99 ? '99+' : user.unreadCount}
          </div>
        )}
      </div>
      
      <div className={styles.chatItemContent}>
        <div className={styles.chatItemHeader}>
          <h3 className={styles.chatItemName}>
            {user.name}
          </h3>
          <span className={styles.chatItemTime}>
            {formatTime(user.lastMessageTime)}
          </span>
        </div>
        <p className={styles.chatItemMessage}>
          {user.lastMessage}
        </p>
      </div>

    </div>
  )
} 