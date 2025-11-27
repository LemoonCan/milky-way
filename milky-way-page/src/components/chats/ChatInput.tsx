import React, { useRef, useState } from 'react'
import { Smile, Paperclip, Bot, Phone, Video } from 'lucide-react'
import { EmojiPicker } from './EmojiPicker'
import { FileUploadDialog } from './FileUploadDialog'
import { TextInput } from './TextInput'

import { showError } from '../../lib/globalErrorHandler'
import { chatService } from '../../services/chat'
import styles from '../../css/chats/ChatWindow.module.css'

interface ChatInputProps {
  inputValue: string
  onInputChange: (value: string) => void
  uploadingFiles: Set<string>
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  currentChatId: string | null
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  uploadingFiles,
  textareaRef,
  currentChatId
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiButtonElement, setEmojiButtonElement] = useState<HTMLElement | null>(null)
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoadingAiReply, setIsLoadingAiReply] = useState(false)


  // 处理文件上传按钮点击
  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 处理文件选择
  const handleFileSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // 检查文件数量限制
    if (files.length > 9) {
      showError('最多只能选择9个文件')
      return
    }

    // 转换为数组并保存
    const fileArray = Array.from(files)
    setSelectedFiles(fileArray)
    
    // 重置文件输入框
    event.target.value = ''

    // 显示文件预览弹框
    setShowFilePreview(true)
  }

  // 关闭文件预览弹框
  const handleCloseFilePreview = () => {
    setShowFilePreview(false)
    setSelectedFiles([])
  }

  // 处理表情按钮点击
  const handleEmojiButtonClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setEmojiButtonElement(e.currentTarget)
    setShowEmojiPicker(!showEmojiPicker)
  }

  // 处理emoji选择
  const handleEmojiSelect = (emoji: string) => {
    // 获取当前光标位置
    const textarea = textareaRef.current
    if (!textarea) return

    const startPos = textarea.selectionStart
    const endPos = textarea.selectionEnd
    
    // 在光标位置插入emoji
    const newValue = inputValue.substring(0, startPos) + emoji + inputValue.substring(endPos)
    onInputChange(newValue)

    // 关闭emoji选择器
    setShowEmojiPicker(false)

    // 重新聚焦到输入框并设置光标位置
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        const newCursorPos = startPos + emoji.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  // 关闭emoji选择器
  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false)
  }

  // 处理AI助手按钮点击
  const handleAiAssistantClick = async () => {
    if (!currentChatId) {
      showError('请先选择一个聊天')
      return
    }

    if (isLoadingAiReply) {
      return
    }

    try {
      setIsLoadingAiReply(true)
      onInputChange('')


      // 调用AI回复接口
      const aiReply = await chatService.getAiReply(currentChatId)

      // 将AI回复内容设置到输入框
      if (aiReply) {
        // 直接填入模式
        onInputChange(aiReply)
        
        // 聚焦到输入框
        setTimeout(() => {
          textareaRef.current?.focus()
          // 将光标移到最后
          if (textareaRef.current) {
            const length = textareaRef.current.value.length
            textareaRef.current.setSelectionRange(length, length)
          }
        }, 0)
      }
    } finally {
      setIsLoadingAiReply(false)
    }
  }

  return (
    <div className={styles.inputToolbar}>
      <div className={styles.toolbarTop}>
        <div className={styles.toolbarLeft}>
          <div 
            className={styles.toolBtn}
            onClick={handleEmojiButtonClick}
            style={{ cursor: 'pointer' }}
          >
            <Smile style={{ width: '20px', height: '20px', color: 'var(--milky-text-light)' }} />
          </div>
          <div 
            className={styles.toolBtn}
            onClick={handleFileUploadClick}
            style={{ cursor: 'pointer' }}
          >
            <Paperclip style={{ width: '20px', height: '20px', color: 'var(--milky-text-light)' }} />
          </div>
          <div 
            className={styles.toolBtn}
            onClick={handleAiAssistantClick}
            style={{ cursor: 'pointer', opacity: isLoadingAiReply ? 0.5 : 1 }}
          >
            <Bot style={{ width: '20px', height: '20px', color: 'var(--milky-text-light)' }} />
          </div>
        </div>
        
        <div className={styles.toolbarRight}>
          <div className={styles.toolBtn}>
            <Phone style={{ width: '20px', height: '20px', color: 'var(--milky-text-light)' }} />
          </div>
          <div className={styles.toolBtn}>
            <Video style={{ width: '20px', height: '20px', color: 'var(--milky-text-light)' }} />
          </div>
        </div>
      </div>
      
      {/* 文件上传状态提示 */}
      {uploadingFiles.size > 0 && (
        <div style={{ padding: '8px', fontSize: '12px', color: 'var(--milky-text-light)' }}>
          正在上传文件...({uploadingFiles.size} 个文件)
        </div>
      )}
      
      {/* 文本输入组件 */}
      <TextInput
        inputValue={inputValue}
        onInputChange={onInputChange}
        uploadingFiles={uploadingFiles}
        textareaRef={textareaRef}
        placeholder="输入消息..."
        currentChatId={currentChatId}
      />

      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        style={{ display: 'none' }}
        onChange={handleFileSelectChange}
      />

      {/* 文件预览弹框 */}
      <FileUploadDialog
        isVisible={showFilePreview}
        onClose={handleCloseFilePreview}
        currentChatId={currentChatId}
        initialFiles={selectedFiles}
      />

      {/* Emoji选择器 */}
      <EmojiPicker
        isVisible={showEmojiPicker}
        onClose={handleCloseEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        triggerElement={emojiButtonElement}
      />
    </div>
  )
} 