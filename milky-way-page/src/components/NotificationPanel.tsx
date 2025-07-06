import React, { useEffect, useRef } from 'react'
import styles from '../css/NotificationPanel.module.css'
import { useNotificationStore } from '../store/notification'
import { MessageNotifyType, type NotificationItem } from '../types/api'
import { Avatar } from './Avatar'
import { BellDot } from 'lucide-react'

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
  const {
    notifications: defaultNotifications,
    stats: defaultStats,
    markAsRead,
    removeNotification,
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

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString()
  }

  // 获取通知图标
  const getNotificationIcon = (type: MessageNotifyType) => {
    switch (type) {
      case MessageNotifyType.LIKE:
        return '👍'
      case MessageNotifyType.COMMENT:
        return '💬'
      default:
        return '📢'
    }
  }

  // 处理通知点击
  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId)
  }

  // 处理删除通知
  const handleDeleteNotification = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    removeNotification(notificationId)
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
            {/* 移除手动按钮，关闭时自动清空 */}
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
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationLeft}>
                      {notification.avatar ? (
                        <Avatar avatarUrl={notification.avatar} size={40} />
                      ) : (
                        <div className={styles.iconContainer}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className={styles.notificationMain}>
                      <div className={styles.notificationTitle}>
                        {notification.title}
                      </div>
                      <div className={styles.notificationMessage}>
                        {notification.message}
                      </div>
                      <div className={styles.notificationTime}>
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    <div className={styles.notificationRight}>
                      {!notification.read && (
                        <div className={styles.unreadDot}></div>
                      )}
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        title="删除"
                      >
                        ×
                      </button>
                    </div>
                  </div>
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
                  <span className={styles.statIcon}>👍</span>
                  <span className={styles.statText}>
                    {stats.likeCount} 个新赞
                  </span>
                </div>
              )}
              {stats.commentCount > 0 && (
                <div className={styles.statItem}>
                  <span className={styles.statIcon}>💬</span>
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