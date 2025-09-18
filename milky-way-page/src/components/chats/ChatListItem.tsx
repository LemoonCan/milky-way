import React from 'react'
import { Avatar } from '../Avatar'
import { EmojiText } from '../EmojiText'
import { TimeFormatter } from '@/utils/timeFormatter'
import type { ChatInfoDTO } from '../../services/chat'
import styles from '../../css/chats/ChatListItem.module.css'

interface ChatListItemProps {
  chat: ChatInfoDTO
  isActive: boolean
  onClick: () => void
}

export const ChatListItem: React.FC<ChatListItemProps> = React.memo(({
  chat,
  isActive,
  onClick,
}) => {

  return (
    <div
      className={`${styles.chatItem} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.avatarContainer}>
        <Avatar 
          size={48}
          userId={chat.id}
          avatarUrl={chat.avatar}
          className={styles.avatar}
        />
        {chat.online && chat.chatType === 'SINGLE' && (
          <div className={styles.onlineIndicator}></div>
        )}
        {chat.unreadCount > 0 && (
          <div className={styles.unreadBadge}>
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </div>
        )}
      </div>
      
      <div className={styles.chatItemContent}>
        <div className={styles.chatItemHeader}>
          <h3 className={styles.chatItemName}>
            <EmojiText text={chat.title} size="1em" />
          </h3>
          <span className={styles.chatItemTime}>
            {TimeFormatter.formatRelativeTime(new Date(chat.lastMessageTime))}
          </span>
        </div>
        <p className={styles.chatItemMessage}>
          <EmojiText text={chat.lastMessage} size="1em" />
        </p>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // 自定义比较函数，只有这些属性变化时才重新渲染
  return (
    prevProps.chat.id === nextProps.chat.id &&
    prevProps.chat.title === nextProps.chat.title &&
    prevProps.chat.lastMessage === nextProps.chat.lastMessage &&
    prevProps.chat.lastMessageTime === nextProps.chat.lastMessageTime &&
    prevProps.chat.unreadCount === nextProps.chat.unreadCount &&
    prevProps.chat.online === nextProps.chat.online &&
    prevProps.isActive === nextProps.isActive
  )
}) 