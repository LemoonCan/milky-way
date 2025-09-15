import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../css/NotificationPanel.module.css'
import { useNotificationStore } from '../store/notification'
import { MessageNotifyType } from '../types/api'
import type { NotificationItem } from '../store/notification'
import type { LikeDTO, CommentWithMomentDTO } from '../services/moment'
import type { MomentDescriptionDTO } from '../services/moment'
import type { SimpleUserDTO } from '../services/user'
import { Avatar } from './Avatar'
import { EmojiText } from './EmojiText'
import { TimeFormatter } from '@/utils/timeFormatter'
import { BellDot, Heart, MessageCircle } from 'lucide-react'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  customNotifications?: NotificationItem[]
  customStats?: { total: number; unread: number; likeCount: number; commentCount: number }
  title?: string
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  isOpen, 
  onClose, 
  customNotifications,
  customStats,
  title = '通知'
}) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const {
    notifications: defaultNotifications,
    stats: defaultStats,
    markAsRead,
    clearAll
  } = useNotificationStore()

  // 使用自定义数据或默认数据
  const notifications = customNotifications || defaultNotifications
  const stats = customStats || defaultStats

  // 处理关闭：自动清空通知
  const handleClose = () => {
    // 关闭时自动清空通知
    clearAll()
    onClose()
  }

  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClose])



  // 处理通知点击 - 跳转到动态详情页
  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification.id)
    
    // 只处理朋友圈相关通知
    if (notification.type === MessageNotifyType.LIKE || notification.type === MessageNotifyType.COMMENT) {
      const content = notification.content as LikeDTO | CommentWithMomentDTO
      let momentId: string | undefined
      
      if (notification.type === MessageNotifyType.LIKE) {
        momentId = (content as LikeDTO).momentDescription.id
      } else if (notification.type === MessageNotifyType.COMMENT) {
        momentId = (content as CommentWithMomentDTO).momentDescription.id
      }
      
      if (momentId) {
        navigate(`/main/moments/detail/${momentId}`)
        onClose()
      }
    }
  }



  // 渲染朋友圈通知内容（四列布局）
  const renderMomentNotification = (notification: NotificationItem) => {
    const content = notification.content as LikeDTO | CommentWithMomentDTO
    
    // 获取动态信息
    let momentDescription: MomentDescriptionDTO
    let user: SimpleUserDTO
    let createTime: string
    
    if (notification.type === MessageNotifyType.LIKE) {
      const likeData = content as LikeDTO
      momentDescription = likeData.momentDescription
      user = likeData.user
      createTime = likeData.createTime
    } else {
      // notification.type === MessageNotifyType.COMMENT
      const commentData = content as CommentWithMomentDTO
      momentDescription = commentData.momentDescription
      user = commentData.user
      createTime = commentData.createTime
    }

    // 渲染第二列内容（昵称+通知内容）
    const renderSecondColumn = () => {
      if (notification.type === MessageNotifyType.LIKE) {
        return (
          <div className={styles.notificationSecondColumn}>
            <div className={styles.userName}>{user?.nickName}</div>
            <div className={styles.notificationAction}>
              <Heart className={styles.likeIcon} size={14} fill="#ef4445" color="#ef4445" />
              <span>赞了你的动态</span>
            </div>
          </div>
        )
      } else if (notification.type === MessageNotifyType.COMMENT) {
        const commentData = content as CommentWithMomentDTO
        return (
          <div className={styles.notificationSecondColumn}>
            <div className={styles.userName}>{user?.nickName}</div>
            <div className={styles.notificationAction}>
              {commentData.parentCommentId ? (
                <EmojiText text={`回复${commentData.replyUser?.nickName || '你'}：${commentData.content}`} />
              ) : (
                <EmojiText text={commentData.content} />
              )}
            </div>
          </div>
        )
      }
    }

    // 渲染第四列内容（动态内容）
    const renderFourthColumn = () => {
      if (!momentDescription) {
        return <div className={styles.loadingPlaceholder}>暂无内容</div>
      }

      // 如果包含图片，显示第一张图片
      if (momentDescription.medias && momentDescription.medias.length > 0) {
        return (
          <div className={styles.momentPreview}>
            <img 
              src={momentDescription.medias[0]} 
              alt="动态图片"
              className={styles.momentImage}
            />
          </div>
        )
      }
      
      // 如果只有文字，显示三个字+...
      if (momentDescription.text) {
        const displayText = momentDescription.text.length > 3 
          ? momentDescription.text.substring(0, 3) + '...' 
          : momentDescription.text
        return (
          <div className={styles.momentPreview}>
            <div className={styles.momentText}>
              <EmojiText text={displayText} />
            </div>
          </div>
        )
      }

      return <div className={styles.momentPreview}>暂无内容</div>
    }

    return (
      <div className={styles.momentNotificationContent}>
        {/* 第一列：头像 */}
        <div className={styles.notificationAvatar}>
          <Avatar avatarUrl={user?.avatar} size={40} />
        </div>
        
        {/* 第二列：昵称+通知内容 */}
        {renderSecondColumn()}
        
        {/* 第三列：时间 */}
        <div className={styles.notificationTime}>
          {TimeFormatter.formatRelativeTime(createTime)}
        </div>
        
        {/* 第四列：动态内容 */}
        {renderFourthColumn()}
      </div>
    )
  }





  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.panel} ref={panelRef}>
        <div className={styles.header}>
          <div className={styles.title}>
            <span>{title}</span>
            {stats.unread > 0 && (
              <span className={styles.badge}>{stats.unread}</span>
            )}
          </div>
          <div className={styles.actions}>
            <button
              className={styles.closeButton}
              onClick={handleClose}
              title="关闭"
            >
              ×
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {notifications.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><BellDot/></div>
              <div className={styles.emptyText}>暂无通知</div>
            </div>
          ) : (
            <div className={styles.notificationList}>
              {notifications.map((notification: NotificationItem) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    !notification.read ? styles.unread : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* 渲染朋友圈通知内容 */}
                  {renderMomentNotification(notification)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 统计信息 */}
        {(stats.likeCount > 0 || stats.commentCount > 0) && (
          <div className={styles.footer}>
            <div className={styles.statsSection}>
              {stats.likeCount > 0 && (
                <div className={styles.statItem}>
                  <Heart className={styles.statIcon} size={14} fill="#ef4445" color="#ef4445" />
                  <span className={styles.statText}>
                    {stats.likeCount} 个新赞
                  </span>
                </div>
              )}
              {stats.commentCount > 0 && (
                <div className={styles.statItem}>
                  <MessageCircle className={styles.statIcon} size={14} />
                  <span className={styles.statText}>
                    {stats.commentCount} 条新评论
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationPanel