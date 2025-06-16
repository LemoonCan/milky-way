import React from 'react'
import { Avatar } from './Avatar'
import type { Message } from '@/store/chat'
import styles from '../css/MessageBubble.module.css'

interface MessageBubbleProps {
  message: Message
  userId?: string
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  userId,
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
        <div className={`${styles.avatarContainer} ${styles.avatarContainerLeft}`}>
          <Avatar 
            size={32}
            userId={userId || 'other-user'}
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
        <div className={`${styles.avatarContainer} ${styles.avatarContainerRight}`}>
          <Avatar 
            size={32}
            userId="current-user"
          />
        </div>
      )}
    </div>
  )
} 