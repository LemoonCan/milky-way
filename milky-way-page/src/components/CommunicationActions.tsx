import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Phone, Video } from 'lucide-react'
import { useChatStore } from '../store/chat'
import styles from '../css/CommunicationActions.module.css'

interface CommunicationActionsProps {
  /** 用户ID */
  userId: string
  /** 用户昵称 */
  userName: string
  /** 是否禁用所有操作 */
  disabled?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 自定义发消息处理函数 */
  onSendMessage?: (userId: string, userName: string) => void
  /** 自定义语音通话处理函数 */
  onVoiceCall?: (userId: string, userName: string) => void
  /** 自定义视频通话处理函数 */
  onVideoCall?: (userId: string, userName: string) => void
}

export const CommunicationActions: React.FC<CommunicationActionsProps> = ({
  userId,
  userName,
  disabled = false,
  className = '',
  onSendMessage,
  onVoiceCall,
  onVideoCall
}) => {
  const navigate = useNavigate()
  const { setPendingFriendUserId } = useChatStore()

  // 默认发消息处理函数
  const handleSendMessage = async () => {
    if (onSendMessage) {
      onSendMessage(userId, userName)
      return
    }

    try {
      console.log('Starting chat with user:', userName, 'userId:', userId)
      
      // 设置待处理的好友用户ID到全局状态
      setPendingFriendUserId(userId)
      
      // 跳转到聊天页面（ChatList组件会监听并处理）
      navigate('/main/messages')
    } catch (error) {
      console.error('Failed to start chat with user:', error)
      // 清除待处理状态
      setPendingFriendUserId(null)
    }
  }

  // 默认语音通话处理函数
  const handleVoiceCall = () => {
    if (onVoiceCall) {
      onVoiceCall(userId, userName)
      return
    }
    
    console.log('Voice call to:', userName, 'userId:', userId)
    // TODO: 实现语音通话功能
  }

  // 默认视频通话处理函数
  const handleVideoCall = () => {
    if (onVideoCall) {
      onVideoCall(userId, userName)
      return
    }
    
    console.log('Video call to:', userName, 'userId:', userId)
    // TODO: 实现视频通话功能
  }

  const containerClass = `${styles.communicationActions} ${className}`

  return (
    <div className={containerClass}>
      <button
        onClick={handleSendMessage}
        className={styles.actionButton}
        disabled={disabled}
      >
        <MessageCircle size={24} />
        <span>发消息</span>
      </button>
      
      <button
        onClick={handleVoiceCall}
        className={styles.actionButton}
        disabled={disabled}
      >
        <Phone size={24} />
        <span>语音通话</span>
      </button>
      
      <button
        onClick={handleVideoCall}
        className={styles.actionButton}
        disabled={disabled}
      >
        <Video size={24} />
        <span>视频通话</span>
      </button>
    </div>
  )
}
