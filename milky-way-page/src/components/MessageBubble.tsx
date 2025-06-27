import React from 'react'
import { Avatar } from './Avatar'
import type { Message } from '@/store/chat'
import styles from '../css/MessageBubble.module.css'

interface MessageBubbleProps {
  message: Message
  userId?: string
  userAvatar?: string // 消息发送者的头像
  currentUserId?: string
  currentUserAvatar?: string
  onAvatarClick?: (isFromMe: boolean, element: HTMLElement) => void
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  userId,
  userAvatar,
  currentUserId,
  currentUserAvatar,
  onAvatarClick,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isFromMe = message.sender === 'me'

  return (
    <div className={`${styles.messageContainer} ${isFromMe ? styles.messageContainerFromMe : styles.messageContainerFromOther}`}>
      {!isFromMe && (
        <div 
          className={`${styles.avatarContainer} ${styles.avatarContainerLeft}`}
          onClick={(e) => onAvatarClick?.(false, e.currentTarget)}
          style={{ cursor: onAvatarClick ? 'pointer' : 'default' }}
        >
          <Avatar 
            size={32}
            userId={userId || 'other-user'}
            avatarUrl={userAvatar}
          />
        </div>
      )}
      
      <div className={`${styles.messageContent} ${isFromMe ? styles.messageContentAlignEnd : styles.messageContentAlignStart}`}>
        <div
          className={`${styles.messageBubble} ${isFromMe ? styles.messageBubbleSent : styles.messageBubbleReceived}`}
        >
          <p className={styles.messageText}>
            {message.content}
          </p>
        </div>
        <span className={styles.messageTime}>
          {formatTime(message.timestamp)}
        </span>
      </div>
      
      {isFromMe && (
        <div 
          className={`${styles.avatarContainer} ${styles.avatarContainerRight}`}
          onClick={(e) => onAvatarClick?.(true, e.currentTarget)}
          style={{ cursor: onAvatarClick ? 'pointer' : 'default' }}
        >
          <Avatar 
            size={32}
            userId={currentUserId || "current-user"}
            avatarUrl={currentUserAvatar}
          />
        </div>
      )}
    </div>
  )
} 