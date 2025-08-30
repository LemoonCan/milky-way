import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { Avatar } from '../Avatar'

import { ConfirmDialog } from '../ui/confirm-dialog'
import { ChatInput } from './ChatInput'

import { Trash2 } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import { chatService } from '../../services/chat'
import styles from '../../css/chats/ChatWindow.module.css'
import { EmojiText } from '../EmojiText'

export const ChatWindow: React.FC = () => {
  const [inputValue, setInputValue] = useState('')

  const [showMoreActions, setShowMoreActions] = useState(false)
  const [showDeleteChatDialog, setShowDeleteChatDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const moreActionsRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastScrollTopRef = useRef<number>(0)
  const { loadMoreOlderMessages, removeChat, loadingHistory, setLoadingHistory } = useChatStore()

  const { currentChatId, chats } = useChatStore()
  const currentChat = chats.find(chat => chat.id === currentChatId) || null
  const chatState = useChatStore(s => currentChat ? s.chatMessagesMap[currentChat.id] : undefined)
  const messages = chatState?.messages ?? []

  const scrollToBottomSmooth = () => {
    // 平滑滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 监听聊天切换，设置loadingHistory为false
  useEffect(() => {
    if (currentChatId) {
      setLoadingHistory(false)
    }
  }, [currentChatId, setLoadingHistory])

  // 添加滚动检测逻辑
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop
      const lastScrollTop = lastScrollTopRef.current

      // 检测滚动方向
      if (currentScrollTop < lastScrollTop) {
        // 向上滚动
        setLoadingHistory(true)
      } else if (currentScrollTop > lastScrollTop) {
        // 向下滚动
        setLoadingHistory(false)
      }

      lastScrollTopRef.current = currentScrollTop
    }

    container.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [setLoadingHistory])

  // 监听消息加载完成，确保滚动到底部
  useEffect(() => {
    if (!loadingHistory) {
      setTimeout(() => {
        // 再等待浏览器完成布局计算
        requestAnimationFrame(() => {
          scrollToBottomSmooth()
        })
      }, 100)
    }
  }, [messages, loadingHistory])

  // 使用 Intersection Observer 监听加载更多提示的可见性
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current
    const container = messagesContainerRef.current
    
    if (!loadMoreElement || !container || !currentChat) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // 当"加载更多"提示进入视窗且满足加载条件时，触发加载
          if (entry.isIntersecting && chatState?.hasMoreOlder && !chatState?.isLoading) {            
            const currentScrollHeight = container.scrollHeight
            const currentScrollTop = container.scrollTop
            
            loadMoreOlderMessages(currentChat.id).then(() => {
              // 加载完成后，保持滚动位置
              requestAnimationFrame(() => {
                if (container) {
                  const newScrollHeight = container.scrollHeight
                  const heightDiff = newScrollHeight - currentScrollHeight
                  container.scrollTop = currentScrollTop + heightDiff
                }
              })
            }).catch(error => {
              console.error('加载更多消息失败:', error)
            })
          }
        })
      },
      {
        root: container, // 指定滚动容器作为根元素
        threshold: 0.1, // 当10%的元素可见时触发
        rootMargin: '0px' // 提前20px触发，提供更好的用户体验
      }
    )

    observer.observe(loadMoreElement)

    return () => {
      observer.disconnect()
    }
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
              <EmojiText text={currentChat.name} size="1em" />
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

        {/* 显示是否还有更多历史消息 - 作为 Intersection Observer 的观察目标 */}
        {chatState?.hasMoreOlder && !chatState?.isLoading && messages.length > 0 && (
          <div 
            ref={loadMoreRef}
            style={{ textAlign: 'center', padding: '10px', color: 'var(--milky-text-light)' }}
          >
            向上滑动加载更多历史消息
          </div>
        )}
        
        {/* 加载中指示器 */}
        {chatState?.isLoading && (
          <div style={{ textAlign: 'center', padding: '10px', color: 'var(--milky-text-light)' }}>
            正在加载历史消息...
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