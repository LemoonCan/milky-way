import React from 'react'
import { Avatar } from '../Avatar'
import type { FriendApplication } from '../../types/api'
import styles from '../../css/friends/FriendApplicationItem.module.css'
import { EmojiText } from '../EmojiText'

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
        <Avatar
          size={40}
          userId={application.fromUser.id}
          avatarUrl={application.fromUser.avatar}
          className={styles.avatarImg}
        />
      </div>
      
      <div className={styles.content}>
        <div className={styles.userInfo}>
          <div className={styles.nickname}>
            <EmojiText text={application.fromUser.nickName} size="1em" />
          </div>
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