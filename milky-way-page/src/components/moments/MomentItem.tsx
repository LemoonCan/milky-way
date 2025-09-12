import React, { useState, useRef } from 'react'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar } from '../Avatar'
import { EmojiText } from '../EmojiText'
import { LazyImage } from '../LazyImage'
import { LikeList } from './LikeList'
import { CommentList } from './CommentList'
import { CommentInput } from './CommentInput'
import { ProfileModal } from '../ProfileModal'
import { ConfirmDialog } from '../ui/confirm-dialog'
import { ImagePreviewModal } from '../ImagePreviewModal'
import { TimeFormatter } from '@/utils/timeFormatter'
import { useMomentStore } from '../../store/moment'
import { useUserStore } from '../../store/user'
import type { MomentDTO } from '../../types/api'
import type { SimpleUserDTO } from '../../services/user'
import styles from '../../css/moments/MomentItem.module.css'

interface MomentItemProps {
  moment: MomentDTO
  expandComments?: boolean
}

export const MomentItem: React.FC<MomentItemProps> = ({ moment, expandComments = false }) => {
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [parentCommentId, setParentCommentId] = useState<string | undefined>(undefined)
  const [replyToUser, setReplyToUser] = useState<SimpleUserDTO | undefined>(undefined)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImageIndex, setPreviewImageIndex] = useState(0)
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
  const handleDelete = () => {
    if (isDeleting) return
    setShowDeleteDialog(true)
  }

  // 确认删除
  const confirmDelete = async () => {
    if (isDeleting) return
    await deleteMoment(moment.id)
    setShowDeleteDialog(false)
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
            <div 
              className={styles.imageWrapper}
              onClick={() => {
                setPreviewImageIndex(index)
                setShowImagePreview(true)
              }}
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
            </div>
            {/* 如果是最后一张且还有更多图片 */}
            {!showAllImages && index === maxDisplay - 1 && images.length > maxDisplay && (
              <div 
                className={styles.moreImagesOverlay}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAllImages(true)
                }}
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
            <EmojiText text={moment.user.nickName} size="1em" />
          </div>
          <div className={styles.time}>
            {TimeFormatter.formatRelativeTime(moment.createTime)}
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
          expandedByDefault={expandComments}
          onReply={(commentId?: string) => {
            setParentCommentId(commentId)
            // 找到被回复的评论用户
            if (commentId) {
              const replyComment = moment.comments?.find(comment => comment.id === Number(commentId))
              if (replyComment) {
                setReplyToUser(replyComment.user)
              }
            } else {
              setReplyToUser(undefined)
            }
            setShowCommentInput(true)
          }}
        />
      )}

      {/* 评论输入框 */}
      {showCommentInput && (
        <CommentInput
          momentId={moment.id}
          parentCommentId={parentCommentId}
          replyToUser={replyToUser}
          onClose={() => {
            setParentCommentId(undefined)
            setReplyToUser(undefined)
            setShowCommentInput(false)
          }}
          onComment={() => {
            setParentCommentId(undefined)
            setReplyToUser(undefined)
            setShowCommentInput(false)
          }}
        />
      )}

      {/* 用户信息弹框 */}
      <ProfileModal
        userId={moment.user.id}
        isVisible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        triggerElement={avatarRef.current}
        showActions={false}
      />

      {/* 删除动态确认弹框 */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="删除动态"
        message="确定要删除这条动态吗？删除后将无法恢复。"
        confirmText="删除动态"
        cancelText="取消"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
        previewContent={
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Avatar
              size={36}
              userId={moment.user.id}
              avatarUrl={moment.user.avatar}
            />
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#1a1a1a',
                marginBottom: '4px' 
              }}>
                {moment.user.nickName}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280',
                marginBottom: '8px' 
              }}>
                {TimeFormatter.formatRelativeTime(moment.createTime)}
              </div>
              {moment.text && (
                <div style={{ 
                  fontSize: '13px', 
                  color: '#374151',
                  lineHeight: '1.4',
                  maxHeight: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}>
                  <EmojiText text={moment.text} />
                </div>
              )}
              {moment.medias && moment.medias.length > 0 && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  marginTop: '4px' 
                }}>
                  📷 {moment.medias.length}张图片
                </div>
              )}
            </div>
          </div>
        }
      />
      
      {/* 图片预览弹框 */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        images={moment.medias || []}
        currentIndex={previewImageIndex}
        onIndexChange={setPreviewImageIndex}
      />
    </div>
  )
} 