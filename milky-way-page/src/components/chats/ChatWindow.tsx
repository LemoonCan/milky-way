import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { Avatar } from '../Avatar'

import { ConfirmDialog } from '../ui/confirm-dialog'
import { ChatInput } from './ChatInput'

import { Trash2 } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import { chatService } from '../../services/chat'
import styles from '../../css/chats/ChatWindow.module.css'

export const ChatWindow: React.FC = () => {
  const [inputValue, setInputValue] = useState('')

  const [showMoreActions, setShowMoreActions] = useState(false)
  const [showDeleteChatDialog, setShowDeleteChatDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const moreActionsRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previousChatIdRef = useRef<string | null>(null)
  const { getChatMessages, loadMoreOlderMessages, chatMessagesMap, removeChat } = useChatStore()

  const { currentChatId,chats } = useChatStore()
  const currentChat = chats.find(chat => chat.id === currentChatId) || null
  const messages = currentChat ? getChatMessages(currentChat.id) : []
  const chatState = currentChat ? chatMessagesMap[currentChat.id] : undefined

  const scrollToBottomImmediate = () => {
    // 立即滚动到底部，不使用动画
    if (messagesContainerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
    }
  }

  const scrollToBottomSmooth = () => {
    // 平滑滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 监听消息变化，对于同一个聊天的新消息使用平滑滚动
  useEffect(() => {
    if (currentChat && currentChat.id === previousChatIdRef.current && messages.length > 0) {
      // 同一个聊天中的消息更新，使用平滑滚动
      scrollToBottomSmooth()
    }
  }, [messages, currentChat?.id])

  // 监听消息初次加载完成，确保滚动到底部
  useEffect(() => {
    if (currentChat && messages.length > 0 && chatState && !chatState.isLoading) {
      setTimeout(() => {
        // 再等待浏览器完成布局计算
        requestAnimationFrame(() => {
          scrollToBottomImmediate()
        })
      }, 0)
    }
  }, [currentChat?.id, messages.length, chatState?.isLoading])

  // 监听滚动事件，实现上拉加载更多历史消息
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container || !currentChat) return

    const handleScroll = () => {
      // 当滚动到顶部附近时，加载更多历史消息
      if (container.scrollTop <= 100 && chatState?.hasMoreOlder && !chatState?.isLoading) {
        const scrollHeight = container.scrollHeight
        const scrollTop = container.scrollTop
        
        loadMoreOlderMessages(currentChat.id).then(() => {
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
  }, [currentChat, chatState?.hasMoreOlder, chatState?.isLoading, loadMoreOlderMessages])

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
    if (!currentChat) return

    setIsDeleting(true)
    try {
      await chatService.deleteChat(currentChat.id)
      // 解散成功后，从聊天列表中移除该群聊
      removeChat(currentChat.id)
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

  if (!currentChat) {
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
            userId={currentChat.chatType === 'SINGLE' ? currentChat.friendId : currentChat.id}
            avatarUrl={currentChat.avatar}
            style={{
              boxShadow: 'var(--milky-shadow)'
            }}
          />
          <div className={styles.chatHeaderInfo}>
            <h2 className={styles.chatHeaderName}>
              {currentChat.name}
              {currentChat.chatType === 'SINGLE' && (
                <span className={styles.chatHeaderStatus}>
                  ({currentChat.online ? '在线' : '离线'})
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
          {showMoreActions && currentChat?.chatType === 'GROUP' && (
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
            chatId={currentChat.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入工具栏 */}
      <ChatInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          uploadingFiles={new Set()}
          textareaRef={textareaRef}
          currentChatId={currentChat?.id || null}
        />

      {/* 解散群聊确认弹框 */}
      <ConfirmDialog
        isOpen={showDeleteChatDialog}
        title="解散群聊"
        message={`确定要解散群聊 "${currentChat?.name}" 吗？解散后所有成员将无法再在此群聊中发送消息。`}
        confirmText={isDeleting ? "解散中..." : "解散群聊"}
        cancelText="取消"
        onConfirm={confirmDeleteChat}
        onCancel={() => setShowDeleteChatDialog(false)}
      />
    </div>
  )
} 