import React, { useState, useEffect } from 'react'
import { Play } from 'lucide-react'
import styles from '../../css/chats/VideoMessage.module.css'

interface VideoMessageProps {
  coverUrl: string // 视频封面图URL
  videoUrl?: string // 视频文件URL
  sendStatus?: 'sending' | 'sent' | 'failed'
  fileData?: {
    originalFile?: File
  }
}

export const VideoMessage: React.FC<VideoMessageProps> = ({
  coverUrl,
  videoUrl,
  sendStatus,
  fileData
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null)

  // 处理本地视频文件预览
  useEffect(() => {
    if (fileData?.originalFile && (sendStatus === 'failed' || sendStatus === 'sending')) {
      const videoBlob = URL.createObjectURL(fileData.originalFile)
      setLocalVideoUrl(videoBlob)
      
      // 清理URL对象
      return () => {
        URL.revokeObjectURL(videoBlob)
        setLocalVideoUrl(null)
      }
    } else if (sendStatus === 'sent') {
      // 只有发送成功时才清理本地视频
      setLocalVideoUrl(null)
    }
  }, [fileData?.originalFile, sendStatus])

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  const handleCoverClick = () => {
    // 优先使用本地视频，其次使用服务器视频
    const availableVideoUrl = localVideoUrl || videoUrl
    if (availableVideoUrl && sendStatus !== 'sending') {
      setIsPlaying(true)
    }
  }

  // 如果有本地视频（上传中、重新发送或失败），或者正在播放视频，直接显示视频播放器
  if ((localVideoUrl && (sendStatus === 'sending' || sendStatus === 'failed')) || (isPlaying && (localVideoUrl || videoUrl))) {
    return (
      <div className={styles.videoMessage}>
        <video 
          src={localVideoUrl || videoUrl} 
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