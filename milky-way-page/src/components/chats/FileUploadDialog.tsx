import React, { useState, useEffect } from 'react'
import { X, Image, Video, FileText } from 'lucide-react'
import { chatService } from '../../services/chat'
import { fileService, FilePermission } from '../../services/file'
import { useChatStore } from '@/store/chat'
import { useUserStore } from '@/store/user'
import styles from '../../css/chats/ChatWindow.module.css'

interface FileUploadDialogProps {
  isVisible: boolean
  onClose: () => void
  currentChatId: string | null
  onError: (error: string) => void
  initialFiles?: File[]
  onRemoveFile: (index: number) => void
}

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  isVisible,
  onClose,
  currentChatId,
  onError,
  initialFiles = [],
  onRemoveFile
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles)
  
  const { updateMessageByClientId, addMessage, getChatMessages } = useChatStore()

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

  // 根据文件类型确定消息类型
  const getMessageTypeFromFile = (file: File): 'IMAGE' | 'VIDEO' | 'FILE' => {
    if (file.type.startsWith('image/')) {
      return 'IMAGE'
    } else if (file.type.startsWith('video/')) {
      return 'VIDEO'
    } else {
      return 'FILE'
    }
  }

  // 移除文件
  const handleRemoveFile = (index: number) => {
    onRemoveFile(index)
    // 同时更新本地状态
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 确认发送文件
  const confirmFileUpload = async () => {
    if (!currentChatId || selectedFiles.length === 0) return

    // 立即为每个文件创建临时消息并显示在对话框中
    const fileMessagesData = selectedFiles.map(file => {
      const clientMsgId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const tempMessageId = `temp-${clientMsgId}`
      const messageType = getMessageTypeFromFile(file)
      
      // 创建文件预览URL（用于立即显示）
      const previewUrl = URL.createObjectURL(file)
      
      const messageData = {
        id: tempMessageId,
        clientMsgId,
        chatId: currentChatId,
        sender: (() => {
          // 从 useUserStore 获取真正的当前用户信息
          const userStore = useUserStore.getState()
          const realCurrentUser = userStore.currentUser
          
          if (realCurrentUser) {
            return {
              id: realCurrentUser.id,
              openId: realCurrentUser.openId,
              nickName: realCurrentUser.nickName,
              avatar: realCurrentUser.avatar
            }
          } else {
            return {
              id: 'unknown',
              openId: 'unknown',
              nickName: '我',
              avatar: undefined
            }
          }
        })(),
        meta: {
          type: messageType,
          content: file.name, // 设置文件名到content中
          media: previewUrl // 使用预览URL立即显示
        },
        sentTime: new Date().toISOString(),
        read: false,
        sendStatus: 'sending' as const,
        fileData: {
          originalFile: file,
          isUploading: true,
          uploadProgress: 0
        }
      }
      
      return { messageData, clientMsgId, file }
    })
    
    // 立即添加所有消息到对话框
    fileMessagesData.forEach(({ messageData }) => {
      addMessage(currentChatId, messageData)
    })
    
    // 关闭弹框
    onClose()
    
    // 异步上传文件
    for (const { clientMsgId, file } of fileMessagesData) {
      handleSingleFileUpload(file, clientMsgId)
    }
  }

  // 处理单个文件上传
  const handleSingleFileUpload = async (file: File, clientMsgId: string) => {
    if (!currentChatId) return
    
    try {
      // 更新消息状态为上传中
      updateMessageByClientId(currentChatId, clientMsgId, {
        sendStatus: 'sending',
        fileData: {
          originalFile: file,
          isUploading: true,
          uploadProgress: 0
        }
      })

      // 上传文件到服务器
      const uploadResult = await fileService.uploadFile(file, {
        permission: FilePermission.PRIVATE
      })

      // 根据文件类型确定消息类型
      const messageType = getMessageTypeFromFile(file)
      
      // 上传成功后，更新消息的media URL为服务器URL
      // 同时清理本地预览URL以防止内存泄漏
      const currentMessages = getChatMessages(currentChatId)
      const currentMessage = currentMessages.find(msg => msg.clientMsgId === clientMsgId)
      if (currentMessage && currentMessage.meta.media && currentMessage.meta.media.startsWith('blob:')) {
        URL.revokeObjectURL(currentMessage.meta.media)
      }
      
      updateMessageByClientId(currentChatId, clientMsgId, {
        meta: {
          type: messageType,
          content: file.name, // 保持文件名
          media: uploadResult.fileAccessUrl
        },
        fileData: {
          originalFile: file,
          isUploading: false,
          uploadProgress: 100
        }
      })

      // 发送消息到服务器
      await sendFileMessage(currentChatId, uploadResult.fileAccessUrl, messageType, clientMsgId)

    } catch (error) {
      console.error('文件上传失败:', error)
      
      // 上传失败时也要清理预览URL
      const currentMessages = getChatMessages(currentChatId)
      const currentMessage = currentMessages.find(msg => msg.clientMsgId === clientMsgId)
      if (currentMessage && currentMessage.meta.media && currentMessage.meta.media.startsWith('blob:')) {
        URL.revokeObjectURL(currentMessage.meta.media)
      }
      
      // 标记消息为发送失败
      updateMessageByClientId(currentChatId, clientMsgId, {
        sendStatus: 'failed',
        fileData: {
          originalFile: file,
          isUploading: false,
          uploadProgress: 0
        }
      })
    }
  }

  // 发送文件消息
  const sendFileMessage = async (chatId: string, fileUrl: string, messageType: 'IMAGE' | 'VIDEO' | 'FILE', clientMsgId: string) => {
    try {
      // 发送消息到服务器（不再创建新消息，而是更新现有消息）
      await chatService.sendMessage({
        chatId,
        content: fileUrl,
        messageType,
        clientMsgId
      })
      
      // 设置回执超时：如果15秒内没有收到回执，标记为失败
      setTimeout(() => {
        const currentMessages = getChatMessages(chatId)
        const message = currentMessages.find(msg => msg.clientMsgId === clientMsgId)
        if (message && message.sendStatus === 'sending') {
          updateMessageByClientId(chatId, clientMsgId, { sendStatus: 'failed' })
        }
      }, 15000)
      
    } catch (error) {
      console.error('[FileUploadDialog] 发送文件消息失败:', error)
      
      // 标记消息为发送失败
      updateMessageByClientId(chatId, clientMsgId, {
        sendStatus: 'failed'
      })
      
      throw error
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