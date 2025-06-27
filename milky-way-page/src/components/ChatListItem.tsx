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
    try {
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      
      // 检查时间差是否为负数（未来时间）或过大（可能是错误数据）
      if (diffInMs < 0) {
        return '刚刚'
      }
      
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      
      if (diffInMinutes < 1) {
        return '刚刚'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}分钟前`
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}小时前`
      } else if (diffInMinutes < 10080) { // 7天内
        return `${Math.floor(diffInMinutes / 1440)}天前`
      } else {
        // 超过7天显示具体日期
        return date.toLocaleDateString('zh-CN', { 
          month: '2-digit', 
          day: '2-digit' 
        })
      }
    } catch (error) {
      console.error('时间格式化失败:', error)
      return '时间未知'
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
          avatarUrl={user.avatar}
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