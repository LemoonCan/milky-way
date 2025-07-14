import React from 'react'
import styles from '../../css/chats/VideoMessage.module.css'

interface VideoMessageProps {
  media: string
}

export const VideoMessage: React.FC<VideoMessageProps> = ({
  media
}) => {
  return (
    <div className={styles.videoMessage}>
      <video 
        src={media} 
        controls 
        className={styles.messageVideo}
        preload="metadata"
      />
    </div>
  )
} 