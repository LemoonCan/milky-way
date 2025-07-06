import React from 'react'
import styles from '../css/NotificationButton.module.css'
import { useNotificationStore } from '../store/notification'

interface NotificationButtonProps {
  className?: string
  onClick?: () => void
  customStats?: { total: number; unread: number; likeCount: number; commentCount: number }
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ className = '', onClick, customStats }) => {
  const { stats: defaultStats } = useNotificationStore()
  
  const stats = customStats || defaultStats

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <button className={`${styles.button} ${className}`} onClick={handleClick}>
      <div className={styles.iconContainer}>
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {stats.unread > 0 && (
          <div className={styles.badge}>
            {stats.unread > 99 ? '99+' : stats.unread}
          </div>
        )}
      </div>
    </button>
  )
}

export default NotificationButton 