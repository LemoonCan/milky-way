import React from 'react'
import { Avatar } from '../Avatar'
import type { Friend } from '../../services/friend'
import styles from '../../css/friends/FriendListItem.module.css'
import { EmojiText } from '../EmojiText'

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
          avatarUrl={friend.friend.avatar}
          userId={friend.friend.id}
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
          <EmojiText text={friend.remark || friend.friend.nickName} size="1em" />
        </div>
      </div>
    </div>
  )
} 