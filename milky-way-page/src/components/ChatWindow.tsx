import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { Avatar } from './Avatar'
import { ProfileModal } from './ProfileModal'
import { Smile, Paperclip, Send } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import { useUserStore } from '../store/user'
import type { ChatUser, Message } from '@/store/chat'
import styles from '../css/ChatWindow.module.css'

interface ChatWindowProps {
  currentUser: ChatUser | null
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser }) => {
  const [inputValue, setInputValue] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [modalUser, setModalUser] = useState<any>(null)
  const [showActions, setShowActions] = useState(false)
  const [avatarElement, setAvatarElement] = useState<HTMLElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { getChatMessages, addMessage } = useChatStore()

  const messages = currentUser ? getChatMessages(currentUser.id) : []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      } as any)
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
      } as any)
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

  const handleSendMessage = () => {
    if (!inputValue.trim() || !currentUser) return

    addMessage(currentUser.id, {
      content: inputValue.trim(),
      sender: 'me',
      timestamp: new Date(),
      type: 'text',
    })

    setInputValue('')
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
            style={{
              boxShadow: 'var(--milky-shadow)'
            }}
          />
          <div className={styles.chatHeaderInfo}>
            <h2 className={styles.chatHeaderName}>
              {currentUser.name}
            </h2>
            <p className={styles.chatHeaderStatus}>
              {currentUser.online ? '在线' : '离线'}
            </p>
          </div>
        </div>
        
        <div className={styles.chatHeaderActions}>
          <div className={styles.chatHeaderBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--milky-text-light)" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 聊天消息区域 */}
      <div className={styles.messagesContainer}>
        {messages.map((message: Message) => (
          <MessageBubble
            key={message.id}
            message={message}
            userId={currentUser.id}
            currentUserId={currentUserInfo?.openId || "current-user"}
            currentUserAvatar={currentUserInfo?.avatar}
            onAvatarClick={(isFromMe, element) => {
              handleAvatarClick(isFromMe, element)
            }}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入工具栏 */}
      <div className={styles.inputToolbar}>
        <div className={styles.toolbarTop}>
          <div className={styles.toolbarLeft}>
            <div className={styles.toolBtn}>
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
    </div>
  )
} 