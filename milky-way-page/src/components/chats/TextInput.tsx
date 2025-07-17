import React from 'react'
import { Send } from 'lucide-react'
import { messageManager } from '../../store/messageManager'
import styles from '../../css/chats/ChatWindow.module.css'

interface TextInputProps {
  inputValue: string
  onInputChange: (value: string) => void
  uploadingFiles: Set<string>
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  placeholder?: string
  currentChatId: string | null
}

export const TextInput: React.FC<TextInputProps> = ({
  inputValue,
  onInputChange,
  uploadingFiles,
  textareaRef,
  placeholder = "输入消息...",
  currentChatId
}) => {
  // 直接使用全局messageManager

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 检查是否在输入法编辑状态（composing）
    // 如果在输入法编辑状态，回车键应该用于确认候选词，而不是发送消息
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      await handleSendMessage()
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

  // 处理发送文本消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentChatId) return

    try {
      // 直接使用全局messageManager发送消息
      await messageManager.sendTextMessage(currentChatId, inputValue.trim())
      // 发送成功后清空输入框
      onInputChange('')
    } catch (error) {
      // 服务层已经显示了错误，这里只需要处理UI状态
      console.error('发送文本消息失败:', error)
      
      // 发送失败时也清空输入框
      onInputChange('')
    }
  }

  return (
    <div className={styles.inputContainer}>
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={styles.messageTextarea}
        rows={1}
      />
      <button
        onClick={handleSendMessage}
        disabled={!inputValue.trim() && uploadingFiles.size === 0}
        className={`${styles.sendButton} ${inputValue.trim() ? styles.active : ''}`}
      >
        <Send style={{ width: '20px', height: '20px' }} />
      </button>
    </div>
  )
} 