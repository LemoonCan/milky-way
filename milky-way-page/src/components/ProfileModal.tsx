import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Avatar } from './Avatar'
import { EmojiText } from './EmojiText'
import { MessageCircle, Phone, Video, FileText,CircleX } from 'lucide-react'
import styles from '../css/ProfileModal.module.css'
import { userService } from '../services/user'
import type { UserDetailInfo } from '../services/user'
import type { ApiResponse } from '../types/api'

interface ProfileModalProps {
  userId: string
  isVisible: boolean
  onClose: () => void
  triggerElement?: HTMLElement | null
  showActions?: boolean // 是否显示操作按钮（发消息、语音、视频）
  onMessage?: () => void
  onVoiceCall?: () => void
  onVideoCall?: () => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userId,
  isVisible,
  onClose,
  triggerElement,
  showActions = false,
  onMessage,
  onVoiceCall,
  onVideoCall
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [user, setUser] = useState<UserDetailInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取用户详细信息
  useEffect(() => {
    if (isVisible && userId) {
      setLoading(true)
      setError(null)
      
      userService.getUserDetail(userId)
        .then((response: ApiResponse<UserDetailInfo>) => {
          if (response.success && response.data) {
            setUser(response.data)
          } else {
            setError('获取用户信息失败')
          }
        })
        .catch((err) => {
          console.error('获取用户详细信息失败:', err)
          setError('获取用户信息失败')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isVisible, userId])

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
    const modalHeight = showActions ? 380 : 320 // 增加高度以容纳朋友圈
    
    // 弹框默认出现在触发元素右侧，垂直居中对齐
    let top = rect.top + rect.height / 2 - modalHeight / 2
    let left = rect.right + 8
    
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

  // 格式化朋友圈内容
  const formatMomentContent = (moment: UserDetailInfo['lastMoment']) => {
    if (!moment) return null
    
    const hasText = moment.text && moment.text !== null && moment.text.trim().length > 0
    const hasMedia = moment.medias && moment.medias.length > 0

    if (hasText) {
      return <EmojiText text={moment.text!} size="0.9em" />
    } else if (hasMedia) {
      return (
        <div className={styles.momentImages}>
          {moment.medias!.slice(0, 3).map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`朋友圈图片 ${index + 1}`}
              className={styles.momentImage}
            />
          ))}
          {moment.medias!.length > 3 && (
            <div className={styles.moreImages}>
              +{moment.medias!.length - 3}
            </div>
          )}
        </div>
      )
    }
    
    return null
  }

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
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>加载中...</span>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <div className={styles.errorIcon}>⚠️</div>
            <span>{error}</span>
          </div>
        ) : user ? (
          <>
            {/* 头像和基本信息区域 */}
            <div className={styles.basicInfo}>
              <div className={styles.avatarSection}>
                <Avatar
                  size={70}
                  userId={user.id}
                  avatarUrl={user.avatar}
                  className={styles.largeAvatar}
                />
              </div>
              
              <div className={styles.userInfo}>
                <h3 className={styles.nickname}>
                  <EmojiText text={user.nickName || '未设置昵称'} size="1em" />
                  <span className={styles.genderIcon}>🧑</span>
                </h3>
                <div className={styles.account}>
                  账号：{user.openId}
                </div>
                <div className={styles.region}>
                  地区：未知
                </div>
              </div>
            </div>

            {/* 个性签名 */}
            <div className={styles.signature}>
              <span className={styles.signatureLabel}>个性签名</span>
              <span className={styles.signatureContent}>
                <EmojiText text={user.individualSignature || "无"} size="1em" />
              </span>
            </div>

            {/* 最新动态 */}
            <div className={styles.latestMoment}>
              <div className={styles.momentLabel}>最新动态</div>
              <div className={styles.momentContent}>
                {user.lastMoment ? formatMomentContent(user.lastMoment) : (
                  <div className={styles.noMoment}>
                    <FileText size={16} />
                    <span>暂无动态</span>
                  </div>
                )}
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
          </>
        ) : null}
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
} 