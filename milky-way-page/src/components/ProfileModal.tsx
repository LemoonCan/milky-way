import React, { useEffect, useRef } from 'react'
import { Avatar } from './Avatar'
import { MessageCircle, Phone, Video } from 'lucide-react'
import styles from '../css/ProfileModal.module.css'

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
    if (!triggerElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    
    const rect = triggerElement.getBoundingClientRect()
    const modalWidth = 320
    const modalHeight = showActions ? 280 : 220
    
    // 弹框出现在头像右侧，垂直居中对齐
    let top = rect.top + rect.height / 2 - modalHeight / 2
    let left = rect.right + 8 // 稍微靠近一些
    
    // 检查右侧空间是否足够
    const rightSpace = window.innerWidth - rect.right
    const leftSpace = rect.left
    
    if (rightSpace < modalWidth + 20) {
      // 右侧空间不足，尝试放左侧
      if (leftSpace >= modalWidth + 20) {
        left = rect.left - modalWidth - 8
      } else {
        // 左右都不够，放在下方
        left = Math.max(10, Math.min(
          rect.left + rect.width / 2 - modalWidth / 2,
          window.innerWidth - modalWidth - 10
        ))
        top = rect.bottom + 8
      }
    }
    
    // 垂直位置调整
    if (top < 10) {
      top = 10
    } else if (top + modalHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - modalHeight - 10)
    }
    
    return { 
      top: `${Math.round(top)}px`, 
      left: `${Math.round(left)}px`,
      position: 'fixed' as const
    }
  }

  // 点击外部关闭弹框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // 如果点击的是触发元素，不关闭弹框
      if (triggerElement && triggerElement.contains(target)) {
        return
      }
      
      // 如果点击的是弹框外部，关闭弹框
      if (modalRef.current && !modalRef.current.contains(target)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose, triggerElement])

  if (!isVisible) return null

  const modalPosition = getModalPosition()

  return (
    <div className={styles.overlay}>
      <div
        ref={modalRef}
        className={styles.modal}
        style={modalPosition}
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
              {user.nickname || '未设置昵称'} 
              <span className={styles.genderIcon}>🧑</span>
            </h3>
            <div className={styles.account}>
              微信号：{user.account || user.openId || user.id}
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
            {user.signature || '君子之交'}
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
    </div>
  )
} 