import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { Avatar } from '../Avatar'
import { ProfileModal } from '../settings/ProfileModal'
import { EmojiPicker } from './EmojiPicker'
import { ConfirmDialog } from '../ui/confirm-dialog'
import { Smile, Paperclip, Send, Trash2 } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import { useUserStore } from '../../store/user'
import { chatService } from '../../services/chat'
import type { ChatUser } from '@/store/chat'
import styles from '../../css/chats/ChatWindow.module.css'

// 定义用户信息类型，替换any
interface UserInfo {
  id: string
  openId?: string
  nickname: string
  account: string
  avatar?: string
  signature?: string
  region?: string
}

interface ChatWindowProps {
  currentUser: ChatUser | null
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser }) => {
  const [inputValue, setInputValue] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [modalUser, setModalUser] = useState<UserInfo | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [avatarElement, setAvatarElement] = useState<HTMLElement | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [emojiButtonElement, setEmojiButtonElement] = useState<HTMLElement | null>(null)
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [showDeleteChatDialog, setShowDeleteChatDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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

  // 获取当前用户信息
  const { currentUser: currentUserInfo } = useUserStore()

  // 处理头像点击
  const handleAvatarClick = (isFromMe: boolean, element: HTMLElement) => {
    // 确保在设置弹框状态前，先设置触发元素
    setAvatarElement(element)
    
    if (isFromMe && currentUserInfo) {
      // 点击自己的头像
      setModalUser({
        id: currentUserInfo.openId || 'current-user',
        openId: currentUserInfo.openId,
        nickname: currentUserInfo.nickName,
        account: currentUserInfo.openId,
        avatar: currentUserInfo.avatar,
        signature: currentUserInfo.individualSignature,
        region: '未知'
      })
      setShowActions(false)
    } else if (!isFromMe && currentUser) {
      // 点击好友的头像
      setModalUser({
        id: currentUser.id,
        nickname: currentUser.name,
        account: currentUser.id,
        avatar: currentUser.avatar,
        signature: '这是一个很酷的人',
        region: '加拿大 狼村'
      })
      setShowActions(true)
    }
    
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
    console.log('发起语音通话:', modalUser?.nickname)
  }

  const handleVideoCall = () => {
    setShowProfileModal(false)
    console.log('发起视频通话:', modalUser?.nickname)
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
    updateMessageByClientId(currentUser.id, targetMessage.clientMsgId || targetMessage.id, {
      clientMsgId: retryClientMsgId,
      sendStatus: 'sending'
    })

    // 使用统一的发送逻辑进行重试
    try {
      await chatService.sendMessage({
        chatId: currentUser.id,
        content: targetMessage.content,
        messageType: 'TEXT',
        clientMsgId: retryClientMsgId
      })

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
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
            userId={currentUser.id}
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
            onAvatarClick={(isFromMe, element) => {
              handleAvatarClick(isFromMe, element)
            }}
            onRetryMessage={handleRetryMessage}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入工具栏 */}
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
            <div className={styles.toolBtn}>
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
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`${styles.sendButton} ${inputValue.trim() ? styles.active : ''}`}
          >
            <Send style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        
        <div className={styles.inputHint}>
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>

      {/* 个人信息弹框 */}
      {modalUser && (
        <ProfileModal
          user={modalUser}
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
    </div>
  )
} 