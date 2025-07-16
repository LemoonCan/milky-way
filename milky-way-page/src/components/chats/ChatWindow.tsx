import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { Avatar } from '../Avatar'
import { ProfileModal } from '../ProfileModal'
import { EmojiPicker } from './EmojiPicker'
import { ConfirmDialog } from '../ui/confirm-dialog'
import { ImagePreviewModal } from '../ImagePreviewModal'
import { ChatInput } from './ChatInput'
import { FileUploadDialog } from './FileUploadDialog'
import { Trash2 } from 'lucide-react'
import { useChatStore, isMessageFromMe, type MessageWithStatus } from '@/store/chat'
import { chatService } from '../../services/chat'
import type { ChatUser } from '@/store/chat'
import styles from '../../css/chats/ChatWindow.module.css'
import { showError } from '../../lib/globalErrorHandler'


interface ChatWindowProps {
  currentUser: ChatUser | null
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser }) => {
  const [inputValue, setInputValue] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [modalUserId, setModalUserId] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [avatarElement, setAvatarElement] = useState<HTMLElement | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiButtonElement, setEmojiButtonElement] = useState<HTMLElement | null>(null)
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [showDeleteChatDialog, setShowDeleteChatDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('')
  const moreActionsRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previousUserIdRef = useRef<string | null>(null)
  const { getChatMessages, sendMessageViaWebSocket, loadMoreOlderMessages, chatMessagesMap, updateMessageByClientId, removeChatUser } = useChatStore()

  const messages = currentUser ? getChatMessages(currentUser.id) : []
  const chatState = currentUser ? chatMessagesMap[currentUser.id] : undefined

  const scrollToBottomImmediate = () => {
    // 立即滚动到底部，不使用动画
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  const scrollToBottomSmooth = () => {
    // 平滑滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 监听当前用户切换，立即滚动到底部
  useEffect(() => {
    if (currentUser && currentUser.id !== previousUserIdRef.current) {
      // 用户切换了聊天对象，立即滚动到底部
      previousUserIdRef.current = currentUser.id
      
      // 清空文件选择状态
      setShowFilePreview(false)
      
      // 使用多重保障确保滚动生效
      const forceScrollToBottom = () => {
        scrollToBottomImmediate()
        // 双重保障，确保滚动生效
        requestAnimationFrame(() => {
          scrollToBottomImmediate()
        })
      }

      // 立即执行一次
      forceScrollToBottom()
      
      // 也设置一个短暂延迟，以防消息还在加载
      setTimeout(forceScrollToBottom, 100)
    }
  }, [currentUser?.id])

  // 监听消息变化，对于同一个聊天的新消息使用平滑滚动
  useEffect(() => {
    if (currentUser && currentUser.id === previousUserIdRef.current && messages.length > 0) {
      // 同一个聊天中的消息更新，使用平滑滚动
      scrollToBottomSmooth()
    }
  }, [messages, currentUser?.id])

  // 监听消息初次加载完成，确保滚动到底部
  useEffect(() => {
    if (currentUser && messages.length > 0 && chatState && !chatState.isLoading) {
      // 消息加载完成后，确保滚动到底部
      const ensureScrollToBottom = () => {
        scrollToBottomImmediate()
        // 额外保障
        requestAnimationFrame(() => {
          scrollToBottomImmediate()
        })
      }

      // 立即执行
      ensureScrollToBottom()
      
      // 稍微延迟执行，确保DOM完全渲染
      setTimeout(ensureScrollToBottom, 50)
    }
  }, [currentUser?.id, messages.length, chatState?.isLoading])

  // 监听滚动事件，实现上拉加载更多历史消息
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container || !currentUser) return

    const handleScroll = () => {
      // 当滚动到顶部附近时，加载更多历史消息
      if (container.scrollTop <= 100 && chatState?.hasMoreOlder && !chatState?.isLoading) {
        const scrollHeight = container.scrollHeight
        const scrollTop = container.scrollTop
        
        loadMoreOlderMessages(currentUser.id).then(() => {
          // 加载完成后，保持滚动位置
          requestAnimationFrame(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight
              container.scrollTop = scrollTop + (newScrollHeight - scrollHeight)
            }
          })
        })
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [currentUser, chatState?.hasMoreOlder, chatState?.isLoading, loadMoreOlderMessages])

  // 获取聊天对象的用户ID（在单聊中）
  const getChatPartnerUserId = (): string | null => {
    if (!currentUser || currentUser.chatType !== 'SINGLE') return null
    
    // 从消息记录中找到不是当前用户发送的消息，获取发送者ID
    const partnerMessage = messages.find(msg => !isMessageFromMe(msg))
    if (partnerMessage) {
      return partnerMessage.sender.id
    }
    
    return null
  }

  // 处理头像点击
  const handleAvatarClick = (isFromMe: boolean, element: HTMLElement, userId: string) => {
    // 确保在设置弹框状态前，先设置触发元素
    setAvatarElement(element)
    
    // 直接使用传入的userId
    setModalUserId(userId)
    setShowActions(!isFromMe) // 点击自己的头像不显示操作按钮，点击他人头像显示
    
    // 使用 setTimeout 确保 DOM 更新后再显示弹框
    setTimeout(() => {
      setShowProfileModal(true)
    }, 0)
  }

  const handleCloseProfileModal = () => {
    setShowProfileModal(false)
  }

  const handleMessage = () => {
    setShowProfileModal(false)
    // 已经在当前聊天中，不需要切换
  }

  const handleVoiceCall = () => {
    setShowProfileModal(false)
    console.log('发起语音通话:', modalUserId)
  }

  const handleVideoCall = () => {
    setShowProfileModal(false)
    console.log('发起视频通话:', modalUserId)
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
    setInputValue(newValue)

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

  // 处理图片点击
  const handleImageClick = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl)
    setShowImagePreview(true)
  }

  // 关闭图片预览
  const handleCloseImagePreview = () => {
    setShowImagePreview(false)
    setPreviewImageUrl('')
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentUser) return

    try {
      // 始终使用WebSocket发送消息，让失败处理逻辑统一在 sendMessageViaWebSocket 中处理
      await sendMessageViaWebSocket(currentUser.id, inputValue.trim())
      setInputValue('')
    } catch (error) {
      console.error('发送消息失败:', error)
      // 发送失败时，仍然清空输入框，但可以在此处添加错误提示
      setInputValue('')
    }
  }

  // 重发消息处理
  const handleRetryMessage = async (messageId: string) => {
    if (!currentUser) return

    const targetMessage = messages.find(msg => msg.id === messageId)
    if (!targetMessage) return

    // 为重试消息生成新的 clientMsgId
    const retryClientMsgId = `retry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 更新消息的 clientMsgId 并设置状态为发送中
    const updateData: Partial<MessageWithStatus> = {
      clientMsgId: retryClientMsgId,
      sendStatus: 'sending'
    }
    
    // 如果是文件消息，确保保持fileData
    if (targetMessage.fileData?.originalFile) {
      updateData.fileData = {
        originalFile: targetMessage.fileData.originalFile,
        isUploading: true,
        uploadProgress: 0
      }
    }
    
    updateMessageByClientId(currentUser.id, targetMessage.clientMsgId || targetMessage.id, updateData)

    // 根据消息类型进行重发
    try {
      const messageType = targetMessage.meta.type
      
      if (messageType === 'TEXT') {
        // 文本消息重发
        await chatService.sendMessage({
          chatId: currentUser.id,
          content: targetMessage.meta.content,
          messageType: 'TEXT',
          clientMsgId: retryClientMsgId
        })
      } else {
        // 其他类型消息暂不支持重发
        throw new Error('该消息类型暂不支持重发')
      }

      // 设置回执超时：如果15秒内没有收到回执，标记为失败
      setTimeout(() => {
        const currentMessages = getChatMessages(currentUser.id)
        const retryMessage = currentMessages.find(msg => msg.clientMsgId === retryClientMsgId)
        if (retryMessage && retryMessage.sendStatus === 'sending') {
          updateMessageByClientId(currentUser.id, retryClientMsgId, { sendStatus: 'failed' })
        }
      }, 15000)

    } catch (error) {
      console.error('重发消息失败:', error)
      // 重试失败，标记为失败状态
      updateMessageByClientId(currentUser.id, retryClientMsgId, { sendStatus: 'failed' })
    }
  }



  // 处理更多操作按钮点击
  const handleMoreActionsClick = () => {
    setShowMoreActions(!showMoreActions)
  }

  // 处理解散群聊
  const handleDeleteChat = () => {
    setShowMoreActions(false)
    setShowDeleteChatDialog(true)
  }

  // 确认解散群聊
  const confirmDeleteChat = async () => {
    if (!currentUser) return

    setIsDeleting(true)
    try {
      await chatService.deleteChat(currentUser.id)
      // 解散成功后，从聊天列表中移除该群聊
      removeChatUser(currentUser.id)
      setShowDeleteChatDialog(false)
      console.log('群聊解散成功')
    } catch (error) {
      console.error('解散群聊失败:', error)
      // 这里可以添加错误提示
    } finally {
      setIsDeleting(false)
    }
  }

  // 处理文件上传按钮点击
  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // 移除选中的文件
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 关闭文件预览弹框
  const handleCloseFilePreview = () => {
    setShowFilePreview(false)
    setSelectedFiles([])
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setShowMoreActions(false)
      }
    }

    if (showMoreActions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMoreActions])

  if (!currentUser) {
    return (
      <div className={styles.chatWindow}>
      </div>
    )
  }

  return (
    <div className={styles.chatWindow}>
      {/* 聊天头部 */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderUser}>
          <Avatar 
            size={40}
            userId={getChatPartnerUserId() || currentUser.id}
            avatarUrl={currentUser.avatar}
            style={{
              boxShadow: 'var(--milky-shadow)'
            }}
          />
          <div className={styles.chatHeaderInfo}>
            <h2 className={styles.chatHeaderName}>
              {currentUser.name}
              {currentUser.chatType === 'SINGLE' && (
                <span className={styles.chatHeaderStatus}>
                  ({currentUser.online ? '在线' : '离线'})
                </span>
              )}
            </h2>
          </div>
        </div>
        
        <div className={styles.chatHeaderActions} ref={moreActionsRef}>
          <div 
            className={styles.chatHeaderBtn}
            onClick={handleMoreActionsClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--milky-text-light)" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </div>
          
          {/* 更多操作下拉菜单 */}
          {showMoreActions && currentUser?.chatType === 'GROUP' && (
            <div className={styles.moreActionsMenu}>
              <button
                onClick={handleDeleteChat}
                className={`${styles.moreActionItem} ${styles.dangerAction}`}
              >
                <Trash2 size={16} />
                解散群聊
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 聊天消息区域 */}
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        {/* 显示加载状态 */}
        {chatState?.isLoading && (
          <div style={{ textAlign: 'center', padding: '10px', color: 'var(--milky-text-light)' }}>
            正在加载消息...
          </div>
        )}
        
        {/* 显示是否还有更多历史消息 */}
        {chatState?.hasMoreOlder && !chatState?.isLoading && messages.length > 0 && (
          <div style={{ textAlign: 'center', padding: '10px', color: 'var(--milky-text-light)' }}>
            向上滑动加载更多历史消息
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onAvatarClick={handleAvatarClick}
            onRetryMessage={handleRetryMessage}
            onImageClick={handleImageClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 文件预览弹框 */}
      <FileUploadDialog
        isVisible={showFilePreview}
        onClose={handleCloseFilePreview}
        currentChatId={currentUser?.id || null}
        onError={showError}
        initialFiles={selectedFiles}
        onRemoveFile={removeSelectedFile}
      />

      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="*/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* 输入工具栏 */}
              <ChatInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onEmojiButtonClick={handleEmojiButtonClick}
          onFileUploadClick={handleFileUploadClick}
          uploadingFiles={new Set()}
          textareaRef={textareaRef}
        />

      {/* 个人信息弹框 */}
      {modalUserId && (
        <ProfileModal
          userId={modalUserId}
          isVisible={showProfileModal}
          onClose={handleCloseProfileModal}
          triggerElement={avatarElement}
          showActions={showActions}
          onMessage={handleMessage}
          onVoiceCall={handleVoiceCall}
          onVideoCall={handleVideoCall}
        />
      )}

      {/* Emoji选择器 */}
      <EmojiPicker
        isVisible={showEmojiPicker}
        onClose={handleCloseEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        triggerElement={emojiButtonElement}
      />

      {/* 图片预览弹框 */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={handleCloseImagePreview}
        images={previewImageUrl ? [previewImageUrl] : []}
        currentIndex={0}
      />

      {/* 解散群聊确认弹框 */}
      <ConfirmDialog
        isOpen={showDeleteChatDialog}
        title="解散群聊"
        message={`确定要解散群聊 "${currentUser?.name}" 吗？解散后所有成员将无法再在此群聊中发送消息。`}
        confirmText={isDeleting ? "解散中..." : "解散群聊"}
        cancelText="取消"
        onConfirm={confirmDeleteChat}
        onCancel={() => setShowDeleteChatDialog(false)}
      />

      {/* 错误提示现在由全局处理 */}
    </div>
  )
} 