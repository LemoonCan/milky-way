import React, { useState } from 'react'
import { ImagePreviewModal } from '../ImagePreviewModal'
import styles from '../../css/chats/ImageMessage.module.css'

interface ImageMessageProps {
  media: string
}

export const ImageMessage: React.FC<ImageMessageProps> = ({
  media
}) => {
  const [showImagePreview, setShowImagePreview] = useState(false)

  // 处理图片点击
  const handleImageClick = () => {
    setShowImagePreview(true)
  }

  // 关闭图片预览
  const handleCloseImagePreview = () => {
    setShowImagePreview(false)
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
      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={handleCloseImagePreview}
        images={media ? [media] : []}
        currentIndex={0}
      />
    </>
  )
} 