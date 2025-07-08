import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Avatar } from '../Avatar'
import { EmojiText } from '../EmojiText'
import { MessageCircle, Phone, Video } from 'lucide-react'
import styles from '../../css/settings/ProfileModal.module.css'

interface ProfileUser {
  id: string
  openId?: string
  nickname?: string
  account?: string
  avatar?: string
  signature?: string
  region?: string
}

interface ProfileModalProps {
  user: ProfileUser
  isVisible: boolean
  onClose: () => void
  triggerElement?: HTMLElement | null
  showActions?: boolean // 是否显示操作按钮（发消息、语音、视频）
  onMessage?: () => void
  onVoiceCall?: () => void
  onVideoCall?: () => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  isVisible,
  onClose,
  triggerElement,
  showActions = false,
  onMessage,
  onVoiceCall,
  onVideoCall
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // 计算弹框位置
  const getModalPosition = () => {
    if (!triggerElement) {
      return { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        position: 'fixed' as const,
        zIndex: 99999
      }
    }
    
    const rect = triggerElement.getBoundingClientRect()
    const modalWidth = 320
    const modalHeight = showActions ? 280 : 220
    
    console.log('Debug info:', {
      triggerElement,
      rect,
      windowSize: { width: window.innerWidth, height: window.innerHeight }
    })
    
    // 弹框默认出现在触发元素右侧，垂直居中对齐
    let top = rect.top + rect.height / 2 - modalHeight / 2
    let left = rect.right + 8
    
    console.log('Calculated position:', { top, left, modalWidth, modalHeight })
    
    // 检查右侧空间是否足够
    if (left + modalWidth > window.innerWidth - 10) {
      // 右侧空间不足，放在左侧
      left = rect.left - modalWidth - 8
    }
    
    // 如果左侧也不够，强制调整到能容纳的位置
    if (left < 10) {
      left = 10
    }
    
    // 垂直位置调整，确保不超出屏幕
    if (top < 10) {
      top = 10
    } else if (top + modalHeight > window.innerHeight - 10) {
      top = window.innerHeight - modalHeight - 10
    }
    
    return { 
      top: `${Math.round(top)}px`, 
      left: `${Math.round(left)}px`,
      position: 'fixed' as const,
      zIndex: 99999
    }
  }

  // ESC键关闭弹框
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const modalPosition = getModalPosition()

  const modalContent = (
    <>
      {/* 透明背景，用于点击外部关闭 */}
      <div 
        className={styles.overlay}
        onClick={onClose}
      />
      <div
        ref={modalRef}
        className={styles.modal}
        style={modalPosition}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头像和基本信息区域 */}
        <div className={styles.basicInfo}>
          <div className={styles.avatarSection}>
            <Avatar
              size={70}
              userId={user.openId || user.id}
              avatarUrl={user.avatar}
              className={styles.largeAvatar}
            />
          </div>
          
          <div className={styles.userInfo}>
            <h3 className={styles.nickname}>
              <EmojiText text={user.nickname || '未设置昵称'} size="1em" />
              <span className={styles.genderIcon}>🧑</span>
            </h3>
            <div className={styles.account}>
              账号：{user.account || user.openId || user.id}
            </div>
            <div className={styles.region}>
              地区：{user.region || '未知'}  
            </div>
          </div>
        </div>

        {/* 个性签名 */}
        <div className={styles.signature}>
          <div className={styles.signatureLabel}>个性签名</div>
          <div className={styles.signatureContent}>
            <EmojiText text={user.signature || '君子之交'} size="1em" />
          </div>
        </div>

        {/* 操作按钮（仅好友头像显示） */}
        {showActions && (
          <div className={styles.actionButtons}>
            <button 
              className={styles.actionBtn}
              onClick={onMessage}
              title="发消息"
            >
              <MessageCircle size={20} />
              <span>发消息</span>
            </button>
            <button 
              className={styles.actionBtn}
              onClick={onVoiceCall}
              title="语音通话"
            >
              <Phone size={20} />
              <span>语音通话</span>
            </button>
            <button 
              className={styles.actionBtn}
              onClick={onVideoCall}
              title="视频通话"
            >
              <Video size={20} />
              <span>视频通话</span>
            </button>
          </div>
        )}
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
} 