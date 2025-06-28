import React, { useState, useEffect } from 'react'
import { ChatListItem } from './ChatListItem'
import { Search, WifiOff, RefreshCw, Wifi } from 'lucide-react'
import { useChatStore, type ChatUser } from '@/store/chat'
import { ConnectionStatus } from '@/utils/websocket'
import styles from '../css/ChatList.module.css'

interface ChatListProps {
  onSelectChat: (userId: string) => void
  selectedChatId: string | null
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { 
    chatUsers, 
    isLoading, 
    hasMoreChats,
    connectionStatus,
    loadChatList, 
    loadMoreChats,
    resetConnection,
    initializeChatService,
    getConnectionDisplayText,
    isConnected,
    isConnecting,
    isRetrying,
    isFailed
  } = useChatStore()

  // 组件挂载时加载聊天列表 - 改进逻辑
  useEffect(() => {
    console.log('[ChatList] 组件挂载，当前连接状态:', connectionStatus)
    
    // 延迟执行，等待WebSocket连接状态稳定
    const timer = setTimeout(() => {
      loadChatList(true) // 刷新模式，清空现有数据重新加载
    }, 500) // 延迟500ms，给WebSocket连接一些时间

    return () => clearTimeout(timer)
  }, []) // 移除 loadChatList 依赖，只在组件挂载时执行一次

  const filteredUsers = chatUsers.filter((user: ChatUser) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 处理滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // 当滚动到底部时加载更多
    if (scrollHeight - scrollTop === clientHeight && hasMoreChats && !isLoading) {
      loadMoreChats()
    }
  }

  // 处理网络重连 - 修复重复重试的问题
  const handleRetryConnection = async () => {
    console.log('[ChatList] handleRetryConnection 被调用')
    console.log('[ChatList] 当前状态:', {
      isRetrying: isRetrying(),
      isConnecting: isConnecting(),
      connectionStatus,
      isFailed: isFailed()
    })
    
    if (isRetrying() || isConnecting()) {
      console.log('[ChatList] 连接正在进行中，跳过重试')
      return
    }
    
    try {
      console.log('[ChatList] 开始重新连接...')
      
      // 简化逻辑：只进行一次WebSocket重连尝试
      if (isFailed() || connectionStatus === ConnectionStatus.DISCONNECTED) {
        console.log('[ChatList] 调用 initializeChatService')
        await initializeChatService()
        console.log('[ChatList] initializeChatService 完成')
      } else {
        console.log('[ChatList] 调用 resetConnection')
        await resetConnection()
        console.log('[ChatList] resetConnection 完成')
      }
      
      // WebSocket连接完成后，检查连接状态再决定是否加载聊天列表
      setTimeout(() => {
        const currentState = useChatStore.getState()
        if (currentState.isConnected()) {
          console.log('[ChatList] WebSocket重连成功，刷新聊天列表')
          loadChatList(true)
        } else {
          console.log('[ChatList] WebSocket重连失败，但仍尝试加载聊天列表（使用HTTP）')
          // 即使WebSocket连接失败，也尝试通过HTTP加载聊天列表
          loadChatList(true)
        }
      }, 500) // 减少延迟到500ms
    } catch (error) {
      console.error('[ChatList] 重新连接失败:', error)
      // 连接失败时也尝试加载聊天列表（通过HTTP）
      setTimeout(() => {
        console.log('[ChatList] 连接失败，尝试通过HTTP加载聊天列表')
        loadChatList(true)
      }, 500)
    }
  }

  // 获取连接状态图标
  const getStatusIcon = () => {
    if (isConnected()) {
      return <Wifi className={styles.networkIcon} />
    } else {
      return <WifiOff className={styles.networkIcon} />
    }
  }

  // 获取连接状态样式
  const getStatusClassName = () => {
    let className = styles.networkStatus
    
    if (isConnected()) {
      className += ` ${styles.networkConnected}`
    } else if (isConnecting() || isRetrying()) {
      className += ` ${styles.networkConnecting}`
    } else if (isFailed()) {
      className += ` ${styles.networkFailed}`
    } else {
      className += ` ${styles.networkDisconnected}`
    }
    
    return className
  }

  // 是否显示重试按钮
  const showRetryButton = () => {
    return (isFailed() || connectionStatus === ConnectionStatus.DISCONNECTED) && !isRetrying() && !isConnecting()
  }

  return (
    <div className={styles.chatList}>
      {/* 头部区域 */}
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>
            消息
          </h1>
          {/* 网络状态指示器 */}
          <div className={getStatusClassName()}>
            <div 
              className={styles.networkIndicator}
              onClick={showRetryButton() ? handleRetryConnection : undefined}
              style={{ cursor: showRetryButton() ? 'pointer' : 'default' }}
            >
              {getStatusIcon()}
              <span className={styles.networkText}>
                {getConnectionDisplayText()}
              </span>
              {(isConnecting() || isRetrying()) && (
                <RefreshCw className={`${styles.retryIcon} ${styles.spinning}`} />
              )}
              {showRetryButton() && (
                <RefreshCw className={styles.retryIcon} />
              )}
            </div>
          </div>
        </div>
        
        {/* 搜索框 */}
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="搜索"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 聊天列表 */}
      <div 
        className={`${styles.chatListContent} ${styles.listContainer}`}
        onScroll={handleScroll}
      >
        {isLoading && chatUsers.length === 0 ? (
          <div className={styles.emptyState}>
            加载中...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? '未找到匹配的聊天' : '暂无聊天记录'}
          </div>
        ) : (
          <div>
            {filteredUsers.map((user: ChatUser) => (
              <ChatListItem
                key={user.id}
                user={user}
                isActive={selectedChatId === user.id}
                onClick={() => onSelectChat(user.id)}
              />
            ))}
            {/* 加载更多指示器 */}
            {isLoading && chatUsers.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                加载更多...
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
} 