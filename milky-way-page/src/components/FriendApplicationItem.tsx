import React from 'react'
import type { FriendApplication } from '../types/api'
import styles from '../css/FriendApplicationItem.module.css'

interface FriendApplicationItemProps {
  application: FriendApplication
  isSelected?: boolean
  onSelect?: (application: FriendApplication) => void
}

// 状态映射为中文
const getStatusText = (status: FriendApplication['status']) => {
  switch (status) {
    case 'APPLYING':
      return '待验证'
    case 'ACCEPTED':
      return '已通过'
    case 'REJECTED':
      return '已拒绝'
    default:
      return '未知状态'
  }
}

// 获取状态样式类名
const getStatusClassName = (status: FriendApplication['status']) => {
  switch (status) {
    case 'APPLYING':
      return styles.statusPending
    case 'ACCEPTED':
      return styles.statusAccepted
    case 'REJECTED':
      return styles.statusRejected
    default:
      return styles.statusDefault
  }
}

export const FriendApplicationItem: React.FC<FriendApplicationItemProps> = ({ 
  application, 
  isSelected = false,
  onSelect 
}) => {
  const handleClick = () => {
    onSelect?.(application)
  }

  return (
    <div 
      className={`${styles.applicationItem} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      <div className={styles.avatar}>
        {application.fromUser.avatar ? (
          <img 
            src={application.fromUser.avatar} 
            alt={application.fromUser.nickName}
            className={styles.avatarImg}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {application.fromUser.nickName.charAt(0)}
          </div>
        )}
      </div>
      
      <div className={styles.content}>
        <div className={styles.userInfo}>
          <div className={styles.nickname}>{application.fromUser.nickName}</div>
        </div>
        
        {application.applyMsg && (
          <div className={styles.message}>
            申请消息：{application.applyMsg}
          </div>
        )}
      </div>

      <div className={styles.status}>
        <span className={getStatusClassName(application.status)}>
          {getStatusText(application.status)}
        </span>
      </div>
    </div>
  )
} 