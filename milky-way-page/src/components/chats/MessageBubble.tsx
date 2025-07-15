import React from 'react'
import { Avatar } from '../Avatar'
import { EmojiText } from '../EmojiText'
import { ImageMessage } from './ImageMessage'
import { VideoMessage } from './VideoMessage'
import { FileMessage } from './FileMessage'
import { RotateCw, AlertCircle, CheckCheck } from 'lucide-react'
import type { MessageWithStatus } from '@/store/chat'
import { isMessageFromMe } from '@/store/chat'
import { useUserStore } from '@/store/user'
import styles from '../../css/chats/MessageBubble.module.css'

interface MessageBubbleProps {
  message: MessageWithStatus
  onAvatarClick?: (isFromMe: boolean, element: HTMLElement, userId: string) => void
  onRetryMessage?: (messageId: string) => void // 重发消息回调
  onImageClick?: (imageUrl: string) => void // 图片点击回调
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onAvatarClick,
  onRetryMessage,
  onImageClick,
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
        userId: currentUser?.id || "current-user",
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

  // 渲染消息内容
  const renderMessageContent = () => {
    switch (message.meta.type) {
      case 'IMAGE':
        return (
          <ImageMessage 
            media={message.meta.media || ''} 
            onLoad={() => {
              // 图片加载完成后可以进行额外处理
            }}
            onClick={() => onImageClick?.(message.meta.media || '')}
          />
        )
      case 'VIDEO':
        return (
          <VideoMessage 
            coverUrl={message.meta.media || ''} 
            videoUrl={message.meta.videoUrl}
            sendStatus={message.sendStatus}
            fileData={message.fileData}
          />
        )
      case 'FILE': {
        // 只有在上传前预览时才从原始文件中读取文件名
        const getFileName = () => {
          // 如果有原始文件且正在上传，使用原始文件名
          if (message.fileData?.originalFile && message.fileData?.isUploading) {
            return message.fileData.originalFile.name
          }
          // 否则使用 meta.content 中的文件名（正常情况）
          return message.meta.content
        }
        
        return (
          <FileMessage 
            media={message.meta.media || ''} 
            fileName={getFileName()}
          />
        )
      }
      case 'TEXT':
      default:
        return (
          <p className={styles.messageText}>
            <EmojiText text={message.meta.content} size="1.2em" />
          </p>
        )
    }
  }

  // 系统消息特殊处理
  if (message.meta.type === 'SYSTEM') {
    return (
      <div className={styles.systemMessageContainer}>
        <div className={styles.systemMessage}>
          <EmojiText text={message.meta.content} size="0.9em" />
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
          onClick={(e) => onAvatarClick?.(false, e.currentTarget, avatarInfo.userId)}
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
        {(message.meta.type === 'IMAGE' || message.meta.type === 'VIDEO' || message.meta.type === 'FILE') ? (
          // 媒体消息不需要气泡背景
          <div className={styles.mediaMessageContainer}>
            {renderMessageContent()}
          </div>
        ) : (
          // 文本消息使用气泡背景
          <div
            className={`${styles.messageBubble} ${isFromMe ? styles.messageBubbleSent : styles.messageBubbleReceived}`}
          >
            {renderMessageContent()}
          </div>
        )}
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
          onClick={(e) => onAvatarClick?.(true, e.currentTarget, avatarInfo.userId)}
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