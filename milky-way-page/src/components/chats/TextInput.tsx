import React from 'react'
import { Send } from 'lucide-react'
import { useChatStore } from '@/store/chat'
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
  const { sendMessageViaWebSocket } = useChatStore()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
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
      // 使用WebSocket发送文本消息
      await sendMessageViaWebSocket(currentChatId, inputValue.trim())
      // 发送成功后清空输入框
      onInputChange('')
    } catch (error) {
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