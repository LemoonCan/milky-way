import React, { useState } from 'react'
import { EmojiText } from './EmojiText'
import { ProfileModal } from './ProfileModal'
import { Avatar } from './Avatar'
import type { CommentDTO } from '../types/api'
import styles from '../css/CommentList.module.css'

interface CommentListProps {
  comments: CommentDTO[]
  momentId: string
  onReply?: (commentId?: string) => void
}

export const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  onReply 
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<CommentDTO['user'] | null>(null)
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
  const [showAllComments, setShowAllComments] = useState(false)
  
  if (!comments || comments.length === 0) return null

  const handleUserClick = (user: CommentDTO['user'], element: HTMLElement) => {
    setSelectedUser(user)
    setTriggerElement(element)
    setShowProfileModal(true)
  }

  const handleReplyUserClick = (replyUser: CommentDTO['replyUser'], element: HTMLElement) => {
    if (replyUser) {
      setSelectedUser(replyUser)
      setTriggerElement(element)
      setShowProfileModal(true)
    }
  }

  // 格式化时间
  const formatTime = (timeString: string) => {
    const now = new Date()
    const time = new Date(timeString)
    const diff = now.getTime() - time.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return time.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }

  const handleReply = (commentId?: string) => {
    onReply?.(commentId)
  }

  // 决定显示的评论数量
  const displayComments = showAllComments ? comments : comments.slice(0, 1)
  const hasMoreComments = comments.length > 1

  return (
    <div className={styles.commentList}>
      {displayComments.map((comment) => (
        <div key={comment.id} className={styles.commentItem}>
          <div className={styles.commentContent}>
            <div 
              className={styles.commentAvatar}
              onClick={(e) => handleUserClick(comment.user, e.currentTarget)}
            >
              <Avatar
                size={32}
                userId={comment.user.id}
                avatarUrl={comment.user.avatar}
              />
            </div>
            <div className={styles.commentText}>
              <div className={styles.username}>
                {comment.user.nickName}
              </div>
              <div className={styles.content}>
                {comment.replyUser && (
                  <span className={styles.replyPrefix}>
                    回复 <button 
                      className={styles.replyUserButton}
                      onClick={(e) => handleReplyUserClick(comment.replyUser, e.currentTarget)}
                    >
                      {comment.replyUser.nickName}
                    </button>：
                  </span>
                )}
                <EmojiText text={comment.content} />
              </div>
            </div>
            <div className={styles.commentMeta}>
              <span className={styles.time}>
                {formatTime(comment.createTime)}
              </span>
              <button 
                className={styles.replyButton}
                onClick={() => handleReply(comment.id.toString())}
              >
                回复
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* 更多评论按钮 */}
      {hasMoreComments && !showAllComments && (
        <div className={styles.moreCommentsContainer}>
          <button 
            className={styles.moreCommentsButton}
            onClick={() => setShowAllComments(true)}
          >
            查看更多评论
          </button>
        </div>
      )}

      {/* 收起评论按钮 */}
      {hasMoreComments && showAllComments && (
        <div className={styles.moreCommentsContainer}>
          <button 
            className={styles.moreCommentsButton}
            onClick={() => setShowAllComments(false)}
          >
            收起评论
          </button>
        </div>
      )}

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
          triggerElement={triggerElement}
          showActions={false}
        />
      )}
    </div>
  )
} 