import React, { useState, useEffect, useRef } from 'react'
import { EmojiText } from '../EmojiText'
import { ProfileModal } from '../ProfileModal'
import { Avatar } from '../Avatar'
import { TimeFormatter } from '@/utils/timeFormatter'
import type { CommentDTO } from '../../services/moment'
import styles from '../../css/moments/CommentList.module.css'

interface CommentListProps {
  comments: CommentDTO[]
  momentId: string
  onReply?: (commentId?: string) => void
  expandedByDefault?: boolean
}

export const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  onReply,
  expandedByDefault = false
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<CommentDTO['user'] | null>(null)
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null)
  const [showAllComments, setShowAllComments] = useState(expandedByDefault)
  const previousCommentCount = useRef(comments.length)
  
  // 监听expandedByDefault的变化，用于外部控制展开状态
  useEffect(() => {
    setShowAllComments(expandedByDefault)
  }, [expandedByDefault])
  
  // 监听评论数量变化，有新评论时自动展开
  useEffect(() => {
    if (comments.length > previousCommentCount.current) {
      setShowAllComments(true)
    }
    previousCommentCount.current = comments.length
  }, [comments.length])
  
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
                <EmojiText text={comment.user.nickName} size="1em" />
              </div>
              <div className={styles.content}>
                {comment.replyUser && (
                  <span className={styles.replyPrefix}>
                    回复 <button 
                      className={styles.replyUserButton}
                      onClick={(e) => handleReplyUserClick(comment.replyUser, e.currentTarget)}
                    >
                      <EmojiText text={comment.replyUser.nickName} size="1em" />
                    </button>：
                  </span>
                )}
                <EmojiText text={comment.content} />
              </div>
            </div>
            <div className={styles.commentMeta}>
              <span className={styles.time}>
                {TimeFormatter.formatRelativeTime(comment.createTime)}
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
          userId={selectedUser.id}
          isVisible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          triggerElement={triggerElement}
          showActions={false}
        />
      )}
    </div>
  )
} 