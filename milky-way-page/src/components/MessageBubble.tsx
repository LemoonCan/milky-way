import React from 'react'
import { Avatar } from './Avatar'
import { EmojiText } from './EmojiText'
import { RotateCw, AlertCircle, CheckCheck } from 'lucide-react'
import type { MessageWithStatus } from '@/store/chat'
import { isMessageFromMe } from '@/store/chat'
import { useUserStore } from '@/store/user'
import styles from '../css/MessageBubble.module.css'

interface MessageBubbleProps {
  message: MessageWithStatus
  onAvatarClick?: (isFromMe: boolean, element: HTMLElement) => void
  onRetryMessage?: (messageId: string) => void // 重发消息回调
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onAvatarClick,
  onRetryMessage,
}) => {
  const { currentUser } = useUserStore()
  
  const formatTime = (sentTime: string) => {
    return new Date(sentTime).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isFromMe = isMessageFromMe(message)

  // 根据消息类型获取头像信息
  const getAvatarInfo = () => {
    if (isFromMe) {
      return {
        userId: currentUser?.openId || "current-user",
        avatarUrl: currentUser?.avatar
      }
    } else {
      return {
        userId: message.sender.id,
        avatarUrl: message.sender.avatar
      }
    }
  }

  const avatarInfo = getAvatarInfo()

  // 渲染发送状态图标
  const renderSendStatus = () => {
    if (!isFromMe || !message.sendStatus) return null
    
    switch (message.sendStatus) {
      case 'sending':
        return (
          <RotateCw 
            size={14} 
            className={styles.sendStatusIcon + ' ' + styles.sendStatusSending}
          />
        )
      case 'failed':
        return (
          <div 
            className={styles.sendStatusIconWrapper}
            onClick={() => onRetryMessage?.(message.id)}
            title="点击重发"
          >
            <AlertCircle 
              size={14} 
              className={styles.sendStatusIcon + ' ' + styles.sendStatusFailed}
            />
          </div>
        )
      case 'sent':
        return (
          <CheckCheck 
            size={14} 
            className={styles.sendStatusIcon + ' ' + styles.sendStatusSent}
          />
        )
      default:
        return null
    }
  }

  // 系统消息特殊处理
  if (message.type === 'SYSTEM') {
    return (
      <div className={styles.systemMessageContainer}>
        <div className={styles.systemMessage}>
          <EmojiText text={message.content} size="0.9em" />
        </div>
        <div className={styles.systemMessageTime}>
          {formatTime(message.sentTime)}
        </div>
      </div>
    )
  }

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
            userId={avatarInfo.userId}
            avatarUrl={avatarInfo.avatarUrl}
          />
        </div>
      )}
      
      <div className={`${styles.messageContent} ${isFromMe ? styles.messageContentAlignEnd : styles.messageContentAlignStart}`}>
        <div
          className={`${styles.messageBubble} ${isFromMe ? styles.messageBubbleSent : styles.messageBubbleReceived}`}
        >
          <p className={styles.messageText}>
            <EmojiText text={message.content} size="1.2em" />
          </p>
        </div>
        <div className={styles.messageTimeContainer}>
          <span className={styles.messageTime}>
            {formatTime(message.sentTime)}
          </span>
          {renderSendStatus()}
        </div>
      </div>
      
      {isFromMe && (
        <div 
          className={`${styles.avatarContainer} ${styles.avatarContainerRight}`}
          onClick={(e) => onAvatarClick?.(true, e.currentTarget)}
          style={{ cursor: onAvatarClick ? 'pointer' : 'default' }}
        >
          <Avatar 
            size={32}
            userId={avatarInfo.userId}
            avatarUrl={avatarInfo.avatarUrl}
          />
        </div>
      )}
    </div>
  )
} 