import React, { useState } from 'react'
import { Play, Clock } from 'lucide-react'
import styles from '../../css/chats/VideoMessage.module.css'

interface VideoMessageProps {
  coverUrl?: string // 视频封面图URL
  videoUrl?: string // 视频文件URL
  sendStatus?: 'sending' | 'sent' | 'failed'
}

export const VideoMessage: React.FC<VideoMessageProps> = ({
  coverUrl,
  videoUrl,
  sendStatus
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [imageError, setImageError] = useState(false)

  // 检查视频是否已过期
  const isExpired = !videoUrl || videoUrl.trim() === ''

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  const handleCoverClick = () => {
    // 如果已过期，不执行任何操作
    if (isExpired) return
    
    // 优先使用本地视频，其次使用服务器视频
    if (videoUrl && sendStatus !== 'sending') {
      setIsPlaying(true)
    }
  }

  // 如果视频已过期，显示过期提示
  if (isExpired) {
    return (
      <div className={styles.videoMessage}>
        <div className={styles.expiredContainer}>
          <Clock size={48} className={styles.expiredIcon} />
          <span className={styles.expiredText}>视频已过期</span>
        </div>
      </div>
    )
  }

  // 如果有本地视频（上传中、重新发送或失败），或者正在播放视频，直接显示视频播放器
  if ((sendStatus === 'sending' || sendStatus === 'failed') || (isPlaying && videoUrl)) {
    return (
      <div className={styles.videoMessage}>
        <video 
          src={videoUrl} 
          controls 
          className={styles.messageVideo}
          preload="metadata"
          onEnded={() => setIsPlaying(false)}
        />
      </div>
    )
  }

  // 默认显示封面图模式（上传完成后）
  return (
    <div className={styles.videoMessage}>
      <div 
        className={styles.videoCover}
        onClick={handleCoverClick}
        style={{ cursor: videoUrl ? 'pointer' : 'default' }}
      >
        {/* 显示封面图或占位符 */}
        {imageError || !coverUrl ? (
          <div className={styles.coverPlaceholder}>
            <Play size={48} fill="white" stroke="none" />
            <span>视频</span>
          </div>
        ) : (
          <img 
            src={coverUrl} 
            alt="视频封面"
            className={styles.coverImage}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
        
        {/* 播放按钮 */}
        {videoUrl && !imageError && coverUrl && (
          <div className={styles.playButton}>
            <Play size={24} fill="white" stroke="none" />
          </div>
        )}
      </div>
    </div>
  )
} 