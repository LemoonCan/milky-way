import React from 'react'
import { Smile, Paperclip, Send } from 'lucide-react'
import styles from '../../css/chats/ChatWindow.module.css'

interface ChatInputProps {
  inputValue: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onEmojiButtonClick: (e: React.MouseEvent<HTMLDivElement>) => void
  onFileUploadClick: () => void
  uploadingFiles: Set<string>
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  onSendMessage,
  onEmojiButtonClick,
  onFileUploadClick,
  uploadingFiles,
  textareaRef
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value)
    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div className={styles.inputToolbar}>
      <div className={styles.toolbarTop}>
        <div className={styles.toolbarLeft}>
          <div 
            className={styles.toolBtn}
            onClick={onEmojiButtonClick}
            style={{ cursor: 'pointer' }}
          >
            <Smile style={{ width: '20px', height: '20px', color: 'var(--milky-text-light)' }} />
          </div>
          <div 
            className={styles.toolBtn}
            onClick={onFileUploadClick}
            style={{ cursor: 'pointer' }}
          >
            <Paperclip style={{ width: '20px', height: '20px', color: 'var(--milky-text-light)' }} />
          </div>
        </div>
        
        <div className={styles.toolbarRight}>
          <div className={styles.toolBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--milky-text-light)" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div className={styles.toolBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--milky-text-light)" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* 文件上传状态提示 */}
      {uploadingFiles.size > 0 && (
        <div style={{ padding: '8px', fontSize: '12px', color: 'var(--milky-text-light)' }}>
          正在上传文件...({uploadingFiles.size} 个文件)
        </div>
      )}
      
      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className={styles.messageTextarea}
          rows={1}
        />
        <button
          onClick={onSendMessage}
          disabled={!inputValue.trim() && uploadingFiles.size === 0}
          className={`${styles.sendButton} ${inputValue.trim() ? styles.active : ''}`}
        >
          <Send style={{ width: '20px', height: '20px' }} />
        </button>
      </div>
      
      <div className={styles.inputHint}>
        按 Enter 发送，Shift + Enter 换行
      </div>

      {/* 错误提示 */}
      {/* 移除错误提示，现在由全局处理 */}
    </div>
  )
} 