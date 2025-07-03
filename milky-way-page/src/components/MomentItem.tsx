import React, { useState, useRef } from 'react'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar } from './Avatar'
import { EmojiText } from './EmojiText'
import { LazyImage } from './LazyImage'
import { LikeList } from './LikeList'
import { CommentList } from './CommentList'
import { CommentInput } from './CommentInput'
import { ProfileModal } from './ProfileModal'
import { useMomentStore } from '../store/moment'
import { useUserStore } from '../store/user'
import type { MomentDTO } from '../types/api'
import styles from '../css/MomentItem.module.css'

interface MomentItemProps {
  moment: MomentDTO
}

export const MomentItem: React.FC<MomentItemProps> = ({ moment }) => {
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [parentCommentId, setParentCommentId] = useState<string | undefined>(undefined)
  const avatarRef = useRef<HTMLDivElement>(null)
  
  const { likeMoment, unlikeMoment, deleteMoment, operationLoading } = useMomentStore()
  const { currentUser } = useUserStore()
  
  const isOwner = currentUser?.id === moment.user.id
  const isLiking = operationLoading[`like_${moment.id}`] || operationLoading[`unlike_${moment.id}`]
  const isDeleting = operationLoading[moment.id]
  
  // 判断当前用户是否已点赞
  const isLiked = moment.likeUsers?.some(user => user.id === currentUser?.id) || false

  // 处理用户头像点击
  const handleAvatarClick = () => {
    setShowProfileModal(true)
  }

  // 处理点赞/取消点赞
  const handleLike = async () => {
    if (isLiking) return
    
    if (isLiked) {
      await unlikeMoment(moment.id)
    } else {
      await likeMoment(moment.id)
    }
  }

  // 处理删除
  const handleDelete = async () => {
    if (isDeleting) return
    
    if (window.confirm('确定要删除这条动态吗？')) {
      await deleteMoment(moment.id)
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

  // 渲染图片网格
  const renderImages = () => {
    if (!moment.medias || moment.medias.length === 0) return null
    
    const images = moment.medias
    const maxDisplay = 9
    const displayImages = showAllImages ? images : images.slice(0, maxDisplay)
    
    // 确定网格类型
    const gridClass = `grid${Math.min(images.length, 9)}`
    
    return (
      <div className={`${styles.imageGrid} ${styles[gridClass]}`}>
        {displayImages.map((url: string, index: number) => (
          <div
            key={index}
            className={styles.imageItem}
          >
            <LazyImage
              src={url}
              alt={`动态图片 ${index + 1}`}
              className={styles.momentImage}
              placeholder={
                <div className={styles.imagePlaceholder}>
                  <div className={styles.placeholderShimmer} />
                </div>
              }
            />
            {/* 如果是最后一张且还有更多图片 */}
            {!showAllImages && index === maxDisplay - 1 && images.length > maxDisplay && (
              <div 
                className={styles.moreImagesOverlay}
                onClick={() => setShowAllImages(true)}
              >
                <span>+{images.length - maxDisplay}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.momentItem}>
      {/* 头部信息 */}
      <div className={styles.header}>
        <div ref={avatarRef} onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
          <Avatar
            size={40}
            userId={moment.user.id}
            avatarUrl={moment.user.avatar}
            className={styles.avatar}
          />
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.username}>
            {moment.user.nickName}
          </div>
          <div className={styles.time}>
            {formatTime(moment.creatTime)}
          </div>
        </div>
        
        {isOwner && (
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className={styles.actionButton}
            >
              {isDeleting ? (
                <div className={styles.loadingSpinner} />
              ) : (
                <Trash2 size={16} />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 文本内容 */}
      {moment.text && (
        <div className={styles.content}>
          <EmojiText text={moment.text} />
        </div>
      )}

      {/* 图片内容 */}
      {renderImages()}

      {/* 互动按钮 */}
      <div className={styles.interactions}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={`${styles.interactionButton} ${isLiked ? styles.liked : ''}`}
        >
          <Heart 
            size={16} 
            fill={isLiked ? '#ef4444' : 'none'}
            color={isLiked ? '#ef4444' : '#6b7280'}
          />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setParentCommentId(undefined)
            setShowCommentInput(true)
          }}
          className={styles.interactionButton}
        >
          <MessageCircle size={16} />
        </Button>
      </div>

      {/* 点赞列表 */}
      {moment.likeUsers && moment.likeUsers.length > 0 && (
        <LikeList likes={moment.likeUsers} />
      )}

      {/* 评论列表 */}
      {moment.comments && moment.comments.length > 0 && (
        <CommentList 
          comments={moment.comments} 
          momentId={moment.id}
          onReply={(commentId?: string) => {
            setParentCommentId(commentId)
            setShowCommentInput(true)
          }}
        />
      )}

      {/* 评论输入框 */}
      {showCommentInput && (
        <CommentInput
          momentId={moment.id}
          parentCommentId={parentCommentId}
          onClose={() => {
            setParentCommentId(undefined)
            setShowCommentInput(false)
          }}
          onComment={() => {
            setParentCommentId(undefined)
            setShowCommentInput(false)
          }}
        />
      )}

      {/* 用户信息弹框 */}
      <ProfileModal
        user={{
          id: moment.user.id,
          nickname: moment.user.nickName,
          avatar: moment.user.avatar
        }}
        isVisible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        triggerElement={avatarRef.current}
        showActions={false}
      />
    </div>
  )
} 