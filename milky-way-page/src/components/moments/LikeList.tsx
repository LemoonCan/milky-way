import React, { useState, useRef } from 'react'
import { Heart } from 'lucide-react'
import { Avatar } from '../Avatar'
import { ProfileModal } from '../settings/ProfileModal'
import type { SimpleUserDTO } from '../../types/api'
import styles from '../../css/moments/LikeList.module.css'

interface LikeListProps {
  likes: SimpleUserDTO[]
}

export const LikeList: React.FC<LikeListProps> = ({ likes }) => {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SimpleUserDTO | null>(null)
  const avatarRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  if (!likes || likes.length === 0) return null

  const handleAvatarClick = (user: SimpleUserDTO) => {
    setSelectedUser(user)
    setShowProfileModal(true)
  }

  return (
    <div className={styles.likeList}>
      <div className={styles.likeIcon}>
        <Heart size={12} fill="currentColor" />
      </div>
      <div className={styles.likeUsers}>
        {likes.slice(0, 8).map((user) => (
          <div
            key={user.id}
            ref={(el) => { avatarRefs.current[user.id] = el }}
            onClick={() => handleAvatarClick(user)}
            style={{ cursor: 'pointer' }}
          >
            <Avatar
              size={20}
              userId={user.id}
              avatarUrl={user.avatar}
              className={styles.likeAvatar}
            />
          </div>
        ))}
        {likes.length > 8 && (
          <span className={styles.moreUsers}>
            +{likes.length - 8}
          </span>
        )}
      </div>

      {/* 用户信息弹框 */}
      {selectedUser && (
        <ProfileModal
          user={{
            id: selectedUser.id,
            nickname: selectedUser.nickName,
            avatar: selectedUser.avatar
          }}
          isVisible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          triggerElement={avatarRefs.current[selectedUser.id]}
          showActions={false}
        />
      )}
    </div>
  )
} 