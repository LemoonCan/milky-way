import React, { useState, useRef, useEffect } from 'react'
import { Send, Smile, X } from 'lucide-react'
import { Button } from './ui/button'
import { EmojiPicker } from './EmojiPicker'
import { useMomentStore } from '../store/moment'
import styles from '../css/CommentInput.module.css'

interface CommentInputProps {
  momentId: string
  parentCommentId?: string
  placeholder?: string
  onClose: () => void
  onComment: () => void
}

export const CommentInput: React.FC<CommentInputProps> = ({
  momentId,
  parentCommentId,
  placeholder = '写评论...',
  onClose,
  onComment
}) => {
  const [content, setContent] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)
  
  const { commentMoment, operationLoading } = useMomentStore()
  const isCommenting = operationLoading[`comment_${momentId}`]

  // 自动聚焦输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // 处理发送评论
  const handleSend = async () => {
    if (!content.trim() || isCommenting) return

    const success = await commentMoment(momentId, content.trim(), parentCommentId)
    
    if (success) {
      setContent('')
      onComment()
    }
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  // 处理emoji选择
  const handleEmojiSelect = (emoji: string) => {
    const textarea = inputRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + emoji + content.substring(end)
    
    setContent(newContent)
    setShowEmojiPicker(false)
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
    }, 0)
  }

  // 自动调整输入框高度
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  // 处理输入内容变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    adjustTextareaHeight()
  }

  return (
    <div className={styles.commentInput}>
      <div className={styles.inputContainer}>
        <textarea
          ref={inputRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.textarea}
          rows={1}
          disabled={isCommenting}
        />
        
        <div className={styles.actions}>
          <Button
            ref={emojiButtonRef}
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={styles.emojiButton}
            disabled={isCommenting}
          >
            <Smile size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={styles.closeButton}
            disabled={isCommenting}
          >
            <X size={16} />
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={!content.trim() || isCommenting}
            size="sm"
            className={styles.sendButton}
          >
            {isCommenting ? (
              <div className={styles.loadingSpinner} />
            ) : (
              <Send size={14} />
            )}
          </Button>
        </div>
      </div>

      {/* Emoji选择器 */}
      <EmojiPicker
        isVisible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
        triggerElement={emojiButtonRef.current}
      />
    </div>
  )
} 