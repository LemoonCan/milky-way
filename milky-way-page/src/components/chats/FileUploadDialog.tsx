import React, { useState, useEffect } from 'react'
import { X, Image, Video, FileText } from 'lucide-react'
import { messageManager } from '../../store/messageManager'
import styles from '../../css/chats/ChatWindow.module.css'

interface FileUploadDialogProps {
  isVisible: boolean
  onClose: () => void
  currentChatId: string | null
  initialFiles?: File[]
}

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  isVisible,
  onClose,
  currentChatId,
  initialFiles = [],
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles)
  
  // 直接使用全局messageManager

  // 当传入初始文件时，设置选中的文件
  useEffect(() => {
    setSelectedFiles(initialFiles)
  }, [initialFiles])

  // 获取文件类型图标
  const getFileTypeIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image size={20} />
    } else if (file.type.startsWith('video/')) {
      return <Video size={20} />
    } else {
      return <FileText size={20} />
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }



  // 移除文件
  const handleRemoveFile = (index: number) => {
    // 同时更新本地状态
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 确认发送文件
  const confirmFileUpload = async () => {
    if (!currentChatId || selectedFiles.length === 0) return

    // 关闭弹框
    onClose()
    
    // 直接使用全局messageManager发送文件
    for (const file of selectedFiles) {
      try {
        await messageManager.sendFileMessage(currentChatId, file)
      } catch (error) {
        console.error('发送文件失败:', error)
        // 错误已经在messageManager中处理了
      }
    }
  }



  if (!isVisible) return null

  return (
    <div className={styles.filePreviewOverlay}>
      <div className={styles.filePreviewDialog}>
        <div className={styles.filePreviewHeader}>
          <h3>发送文件</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.filePreviewContent}>
          {selectedFiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--milky-text-light)' }}>
              没有选择文件
            </div>
          ) : (
            selectedFiles.map((file, index) => (
              <div key={index} className={styles.filePreviewItem}>
                <div className={styles.filePreviewIcon}>
                  {getFileTypeIcon(file)}
                </div>
                <div className={styles.filePreviewInfo}>
                  <div className={styles.filePreviewName}>{file.name}</div>
                  <div className={styles.filePreviewSize}>{formatFileSize(file.size)}</div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className={styles.removeFileButton}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className={styles.filePreviewActions}>
          <button onClick={onClose} className={styles.cancelButton}>
            取消
          </button>
          {selectedFiles.length > 0 && (
            <button onClick={confirmFileUpload} className={styles.confirmButton}>
              发送 ({selectedFiles.length})
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 