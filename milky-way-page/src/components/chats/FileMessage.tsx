import React from 'react'
import { FileText } from 'lucide-react'
import styles from '../../css/chats/FileMessage.module.css'

interface FileMessageProps {
  media: string
  fileName?: string
}

export const FileMessage: React.FC<FileMessageProps> = ({
  media,
  fileName = '文件'
}) => {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = media
    link.download = fileName
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={styles.fileMessage}>
      <div 
        className={styles.fileMessageContent}
        onClick={handleDownload}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleDownload()
          }
        }}
      >
        <FileText size={24} className={styles.fileIcon} />
        <div className={styles.fileInfo}>
          <div className={styles.fileName}>{fileName}</div>
        </div>
      </div>
    </div>
  )
} 