import React from 'react'
import { Avatar } from './Avatar'
import type { Friend } from '../types/api'
import styles from '../css/FriendListItem.module.css'

interface FriendListItemProps {
  friend: Friend
  isActive: boolean
  onClick: () => void
}

export const FriendListItem: React.FC<FriendListItemProps> = ({ 
  friend, 
  isActive, 
  onClick 
}) => {
  return (
    <div 
      className={`${styles.friendListItem} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.avatarContainer}>
        <Avatar
          avatarUrl={friend.avatar}
          userId={friend.openId}
          size={44}
        />
        {friend.status === 'BLACKLISTED' && (
          <div className={styles.blockedIndicator} title="已拉黑">
            🚫
          </div>
        )}
      </div>
      
      <div className={styles.friendInfo}>
        <div className={styles.nickName}>
          {friend.remark || friend.nickName}
        </div>
      </div>
    </div>
  )
} 