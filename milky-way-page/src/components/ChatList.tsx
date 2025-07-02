import React, { useState, useEffect } from 'react'
import { ChatListItem } from './ChatListItem'
import { TitleBar } from './TitleBar'
import { Search } from 'lucide-react'
import { useChatStore, type ChatUser } from '@/store/chat'
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
    loadChatList, 
    loadMoreChats
  } = useChatStore()

  // 组件挂载时加载聊天列表
  useEffect(() => {
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



  return (
    <div className={styles.chatList}>
      {/* 头部区域 */}
      <TitleBar title="消息" />
      
      {/* 搜索框 */}
      <div className={styles.searchSection}>
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