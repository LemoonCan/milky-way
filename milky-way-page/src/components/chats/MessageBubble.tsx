import React, { useState } from 'react'
import { Avatar } from '../Avatar'
import { EmojiText } from '../EmojiText'
import { ImageMessage } from './ImageMessage'
import { VideoMessage } from './VideoMessage'
import { FileMessage } from './FileMessage'
import { ProfileModal } from '../ProfileModal'
import { RotateCw, AlertCircle, CheckCheck } from 'lucide-react'
import { type ClientMessageDTO } from '@/services/chat'
import { isMessageFromMe } from '@/store/chat'
import { useUserStore } from '@/store/user'
import { useMessageRetry } from '@/hooks/useMessageRetry'
import styles from '../../css/chats/MessageBubble.module.css'

interface MessageBubbleProps {
  message: ClientMessageDTO
  chatId: string // 聊天ID，用于重发消息
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  chatId,
}) => {
  const { currentUser } = useUserStore()
  const { retryMessage } = useMessageRetry()
  
  // 个人信息弹框状态
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [modalUserId, setModalUserId] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [avatarElement, setAvatarElement] = useState<HTMLElement | null>(null)
  
  const formatTime = (sentTime: string) => {
    return new Date(sentTime).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 处理消息重发
  const handleRetryMessage = async () => {
    try {
      await retryMessage(chatId, message.id)
    } catch (error) {
      // 服务层已经显示了错误
      console.error('重发消息失败:', error)
    }
  }

  // 处理头像点击
  const handleAvatarClick = (isFromMe: boolean, element: HTMLElement, userId: string) => {
    // 确保在设置弹框状态前，先设置触发元素
    setAvatarElement(element)
    
    // 直接使用传入的userId
    setModalUserId(userId)
    setShowActions(!isFromMe) // 点击自己的头像不显示操作按钮，点击他人头像显示
    
    // 使用 setTimeout 确保 DOM 更新后再显示弹框
    setTimeout(() => {
      setShowProfileModal(true)
    }, 0)
  }

  // 关闭个人信息弹框
  const handleCloseProfileModal = () => {
    setShowProfileModal(false)
  }

  // 处理发消息（个人信息弹框中）
  const handleMessage = () => {
    setShowProfileModal(false)
    // 已经在当前聊天中，不需要切换
  }

  // 处理语音通话
  const handleVoiceCall = () => {
    setShowProfileModal(false)
    console.log('发起语音通话:', modalUserId)
  }

  // 处理视频通话
  const handleVideoCall = () => {
    setShowProfileModal(false)
    console.log('发起视频通话:', modalUserId)
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
            onClick={() => handleRetryMessage()}
            title="点击重发"
          >
            <AlertCircle 
              size={14} 
              className={styles.sendStatusIcon + ' ' + styles.sendStatusFailed}
            />
          </div>
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
          />
        )
      case 'VIDEO':
        return (
          <VideoMessage 
            coverUrl={message.meta.media || undefined}
            videoUrl={message.meta.videoUrl || undefined}
            sendStatus={message.sendStatus}
          />
        )
      case 'FILE': {
        // 只有在上传前预览时才从原始文件中读取文件名
        const getFileName = () => {
          // 如果有原始文件且正在发送，使用原始文件名
          if (message.fileData?.originalFile && message.sendStatus === 'sending') {
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
            <EmojiText text={message.meta.content || ''} size="1.2em" />
          </p>
        )
    }
  }

  // 系统消息特殊处理
  if (message.meta.type === 'SYSTEM') {
    return (
      <div className={styles.systemMessageContainer}>
        <div className={styles.systemMessage}>
          <EmojiText text={message.meta.content || ''} size="0.9em" />
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
          onClick={(e) => handleAvatarClick(false, e.currentTarget, avatarInfo.userId)}
          style={{ cursor: 'pointer' }}
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
          onClick={(e) => handleAvatarClick(true, e.currentTarget, avatarInfo.userId)}
          style={{ cursor: 'pointer' }}
        >
          <Avatar 
            size={32}
            userId={avatarInfo.userId}
            avatarUrl={avatarInfo.avatarUrl}
          />
        </div>
      )}

      {/* 个人信息弹框 */}
      {modalUserId && (
        <ProfileModal
          userId={modalUserId}
          isVisible={showProfileModal}
          onClose={handleCloseProfileModal}
          triggerElement={avatarElement}
          showActions={showActions}
          onMessage={handleMessage}
          onVoiceCall={handleVoiceCall}
          onVideoCall={handleVideoCall}
        />
      )}


    </div>
  )
} 