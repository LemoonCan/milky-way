import React, { useState } from 'react'
import { Clock } from 'lucide-react'
import { ImagePreviewModal } from '../ImagePreviewModal'
import styles from '../../css/chats/ImageMessage.module.css'

interface ImageMessageProps {
  media: string
}

export const ImageMessage: React.FC<ImageMessageProps> = ({
  media
}) => {
  const [showImagePreview, setShowImagePreview] = useState(false)
  
  // 检查媒体是否已过期
  const isExpired = !media || media.trim() === ''

  // 处理图片点击
  const handleImageClick = () => {
    if (!isExpired) {
      setShowImagePreview(true)
    }
  }

  // 关闭图片预览
  const handleCloseImagePreview = () => {
    setShowImagePreview(false)
  }

  if(isExpired){
    return (
      <div className={styles.imageMessage}>
        <div className={styles.expiredContainer}>
          <Clock size={32} className={styles.expiredIcon} />
          <span className={styles.expiredText}>图片已过期</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.imageMessage}>
          <img 
            src={media} 
            alt="图片" 
            className={styles.messageImage}
            onClick={handleImageClick}
            style={{ cursor: 'pointer' }}
          />
      </div>

      {/* 图片预览弹框 */}
      {!isExpired && (
        <ImagePreviewModal
          isOpen={showImagePreview}
          onClose={handleCloseImagePreview}
          images={media ? [media] : []}
          currentIndex={0}
        />
      )}
    </>
  )
} 