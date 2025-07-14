import React from 'react'
import styles from '../../css/chats/ImageMessage.module.css'

interface ImageMessageProps {
  media: string
  onLoad?: () => void
  onClick?: () => void
}

export const ImageMessage: React.FC<ImageMessageProps> = ({
  media,
  onLoad,
  onClick
}) => {
  return (
    <div className={styles.imageMessage}>
      <img 
        src={media} 
        alt="图片" 
        className={styles.messageImage}
        onLoad={onLoad}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      />
    </div>
  )
} 