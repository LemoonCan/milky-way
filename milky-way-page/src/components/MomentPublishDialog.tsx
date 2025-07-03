import React, { useState, useRef } from 'react'
import { X, Image, Smile, Send } from 'lucide-react'
import { Button } from './ui/button'
import { EmojiPicker } from './EmojiPicker'
import { Avatar } from './Avatar'
import { LazyImage } from './LazyImage'
import { useMomentStore } from '../store/moment'
import { useUserStore } from '../store/user'
import styles from '../css/MomentPublishDialog.module.css'

interface MomentPublishDialogProps {
  open: boolean
  onClose: () => void
}

export const MomentPublishDialog: React.FC<MomentPublishDialogProps> = ({
  open,
  onClose
}) => {
  const [content, setContent] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { publishMoment, publishLoading, publishError } = useMomentStore()
  const { currentUser } = useUserStore()

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 限制最多9张图片
    const newFiles = [...selectedImages, ...files].slice(0, 9)
    setSelectedImages(newFiles)

    // 生成预览URL
    const newUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newUrls].slice(0, 9))
  }

  // 移除图片
  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)
    
    setSelectedImages(newImages)
    setPreviewUrls(newUrls)
    
    // 清理URL
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index])
    }
  }

  // 处理发布
  const handlePublish = async () => {
    if (!content.trim() && selectedImages.length === 0) return

    const success = await publishMoment(content.trim(), selectedImages)
    
    if (success) {
      // 清理状态
      setContent('')
      setSelectedImages([])
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setPreviewUrls([])
      onClose()
    }
  }

  // 处理关闭
  const handleClose = () => {
    if (publishLoading) return
    
    // 清理预览URL
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setPreviewUrls([])
    setSelectedImages([])
    setContent('')
    setShowEmojiPicker(false)
    onClose()
  }

  // 处理emoji选择
  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current
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

  // 自动调整文本域高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  // 处理文本变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    adjustTextareaHeight()
  }

  // 渲染图片预览
  const renderImagePreviews = () => {
    if (previewUrls.length === 0) return null

    return (
      <div className={styles.imagePreview}>
        {previewUrls.map((url, index) => (
          <div key={index} className={styles.previewItem}>
            <LazyImage
              src={url}
              alt={`预览图片 ${index + 1}`}
              className={styles.previewImage}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeImage(index)}
              className={styles.removeButton}
              disabled={publishLoading}
            >
              <X size={14} />
            </Button>
          </div>
        ))}
        
        {/* 添加更多图片按钮 */}
        {previewUrls.length < 9 && (
          <div 
            className={styles.addMoreButton}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={24} />
            <span>+</span>
          </div>
        )}
      </div>
    )
  }

  if (!open) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        {/* 头部 */}
        <div className={styles.header}>
          <h3>发布动态</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={publishLoading}
            className={styles.closeButton}
          >
            <X size={20} />
          </Button>
        </div>

        {/* 用户信息 */}
        <div className={styles.userInfo}>
          <Avatar
            size={40}
            userId={currentUser?.id}
            avatarUrl={currentUser?.avatar}
          />
          <span className={styles.username}>
            {currentUser?.nickName || '未登录'}
          </span>
        </div>

        {/* 内容输入 */}
        <div className={styles.content}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            placeholder="分享新鲜事..."
            className={styles.textarea}
            disabled={publishLoading}
            rows={4}
          />

          {/* 图片预览 */}
          {renderImagePreviews()}

          {/* 错误提示 */}
          {publishError && (
            <div className={styles.error}>
              {publishError}
            </div>
          )}
        </div>

        {/* 工具栏 */}
        <div className={styles.toolbar}>
          <div className={styles.tools}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={publishLoading || selectedImages.length >= 9}
              className={styles.toolButton}
            >
              <Image size={20} />
            </Button>
            
            <Button
              ref={emojiButtonRef}
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={publishLoading}
              className={styles.toolButton}
            >
              <Smile size={20} />
            </Button>
          </div>

          <Button
            onClick={handlePublish}
            disabled={(!content.trim() && selectedImages.length === 0) || publishLoading}
            className={styles.publishButton}
          >
            {publishLoading ? (
              <>
                <div className={styles.loadingSpinner} />
                发布中...
              </>
            ) : (
              <>
                <Send size={16} />
                发布
              </>
            )}
          </Button>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Emoji选择器 */}
        <EmojiPicker
          isVisible={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onEmojiSelect={handleEmojiSelect}
          triggerElement={emojiButtonRef.current}
        />
      </div>
    </div>
  )
} 