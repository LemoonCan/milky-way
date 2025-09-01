import React from 'react'
import { Avatar } from '../Avatar'
import { EmojiText } from '../EmojiText'
import { TimeFormatter } from '@/utils/timeFormatter'
import type { Chat } from '@/store/chat'
import styles from '../../css/chats/ChatListItem.module.css'

interface ChatListItemProps {
  chat: Chat
  isActive: boolean
  onClick: () => void
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
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
            <EmojiText text={chat.name} size="1em" />
          </h3>
          <span className={styles.chatItemTime}>
            {TimeFormatter.formatRelativeTime(chat.lastMessageTime)}
          </span>
        </div>
        <p className={styles.chatItemMessage}>
          <EmojiText text={chat.lastMessage} size="1em" />
        </p>
      </div>
    </div>
  )
} 