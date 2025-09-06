import React, { useRef, useEffect, useCallback, useState } from 'react'
import { MessageBubble } from './MessageBubble'
import { MessageTimeHeader } from './MessageTimeHeader'
import { useChatStore } from '@/store/chat'
import type { ChatMessagesState } from '@/store/chat'
import { ChevronsDown } from 'lucide-react'
import styles from '../../css/chats/MessageList.module.css'

interface MessageListProps {
  chatState: ChatMessagesState | undefined
  chatId: string
}

export const MessageList: React.FC<MessageListProps> = ({
  chatState,
  chatId
}) => {
  const messages = chatState?.messages ?? []
  const hasMoreOlder = chatState?.hasMoreOlder ?? false
  const isLoading = chatState?.isLoading ?? false
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { loadMoreOlderMessages } = useChatStore()

  // 添加状态来跟踪滚动方向和加载状态
  const [isScrollingUp, setIsScrollingUp] = useState(false)
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 判断两个消息是否需要显示时间分隔（间隔>=10分钟）
  const shouldShowTimeHeader = (currentMessage: { sentTime: string; meta: { type: string } }, previousMessage?: { sentTime: string }) => {
    // 系统消息不显示时间分隔
    if (currentMessage.meta.type === 'SYSTEM') return false
    
    if (!previousMessage) return true // 第一条消息总是显示时间
    
    const currentTime = new Date(currentMessage.sentTime)
    const previousTime = new Date(previousMessage.sentTime)
    
    // 计算时间差（毫秒）
    const timeDiff = currentTime.getTime() - previousTime.getTime()
    
    // 如果时间差大于等于10分钟（600000毫秒），则显示时间分隔
    return timeDiff >= 10 * 60 * 1000
  }

  const scrollToBottomSmooth = () => {
    // 平滑滚动到底部
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 监听消息变化，确保滚动到底部
  useEffect(() => {
    if (!isScrollingUp && messages.length > 0) {
      setTimeout(() => {
        // 再等待浏览器完成布局计算
        requestAnimationFrame(() => {
          scrollToBottomSmooth()
        })
      }, 100)
    }
  }, [messages])

  useEffect(() => {
    if (messages.length > 0) {
        setTimeout(() => {
          // 再等待浏览器完成布局计算
          requestAnimationFrame(() => {
            scrollToBottomSmooth()
          })
        }, 100)
      }
  }, [chatId])

  // 处理滚动事件，检测滚动方向
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const currentScrollTop = container.scrollTop
    const isUp = currentScrollTop < lastScrollTop
    
    // 只有当滚动距离足够大时才认为是有效的滚动
    const scrollDiff = Math.abs(currentScrollTop - lastScrollTop)
    if (scrollDiff > 10) { // 至少滚动5px才认为是有效滚动
      setIsScrollingUp(isUp)
      setLastScrollTop(currentScrollTop)
    }


  }, [lastScrollTop, hasMoreOlder, isLoading, isLoadingMore])

  // 添加滚动监听
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current)
      }
    }
  }, [handleScroll])

  // 优化的加载更多消息函数
  const handleLoadMoreMessages = useCallback(async () => {
    if (!hasMoreOlder || isLoading || isLoadingMore) {
      return
    }

    setIsLoadingMore(true)
    const container = messagesContainerRef.current
    const currentScrollHeight = container?.scrollHeight || 0
    const currentScrollTop = container?.scrollTop || 0

    try {
      await loadMoreOlderMessages(chatId)
      
      // 加载完成后，保持滚动位置
      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight
          const heightDiff = newScrollHeight - currentScrollHeight
          container.scrollTop = currentScrollTop + heightDiff
        }
      })
    } catch (error) {
      console.error('加载更多消息失败:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [chatId, hasMoreOlder, isLoading, isLoadingMore, loadMoreOlderMessages])

  // 使用 Intersection Observer 监听加载更多提示的可见性
  useEffect(() => {
    const loadMoreElement = loadMoreRef.current
    const container = messagesContainerRef.current
    
    if (!loadMoreElement || !container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {    
          // 只有当用户主动上滑且到达加载区域时才触发加载
          if (
            entry.isIntersecting && 
            hasMoreOlder && 
            !isLoading && 
            !isLoadingMore &&
            isScrollingUp // 确保是上滑操作
          ) {
            handleLoadMoreMessages()
          }
        })
      },
      {
        root: container, // 指定滚动容器作为根元素
        threshold: 0.1, // 当10%的元素可见时触发，更容易触发
        rootMargin: '50px 0px 0px 0px' // 提前50px触发，提供更好的用户体验
      }
    )

    observer.observe(loadMoreElement)

    return () => {
      observer.disconnect()
    }
  }, [hasMoreOlder, isLoading, isLoadingMore, isScrollingUp, handleLoadMoreMessages])

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={styles.messagesContainer} ref={messagesContainerRef}>
      {/* 滚动到底部按钮 - 使用 sticky 布局实现固定效果 */}
      {isScrollingUp && 
      <div className={styles.scrollToBottomWrapper}>
        <button
          className={styles.scrollToBottomBtn}
          onClick={scrollToBottomSmooth}
          title="滚动到底部"
        >
          <span>2条新消息</span>
          <ChevronsDown size={16} />
        </button>
      </div>}

      {/* 显示是否还有更多历史消息 - 作为 Intersection Observer 的观察目标 */}
      {hasMoreOlder && !isLoading && !isLoadingMore && messages.length > 0 && (
        <div 
          ref={loadMoreRef}
          style={{ textAlign: 'center', padding: '10px', color: 'var(--milky-text-light)' }}
        >
          向上滑动加载更多历史消息
        </div>
      )}
      
      {/* 加载中指示器 */}
      {(isLoading || isLoadingMore) && (
        <div style={{ textAlign: 'center', padding: '10px', color: 'var(--milky-text-light)' }}>
          正在加载历史消息...
        </div>
      )}
      
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : undefined
        const showTimeHeader = shouldShowTimeHeader(message, previousMessage)
        
        return (
          <React.Fragment key={message.id}>
            {showTimeHeader && (
              <MessageTimeHeader timestamp={message.sentTime} />
            )}
            <MessageBubble
              message={message}
              chatId={chatId}
            />
          </React.Fragment>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
