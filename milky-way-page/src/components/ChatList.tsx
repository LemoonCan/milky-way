import React, { useState } from 'react'
import { ChatListItem } from './ChatListItem'
import { Search } from 'lucide-react'
import { useChatStore, type ChatUser } from '@/store/chat'
import styles from '../css/ChatList.module.css'

interface ChatListProps {
  onSelectChat: (userId: string) => void
  selectedChatId: string | null
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { chatUsers } = useChatStore()

  const filteredUsers = chatUsers.filter((user: ChatUser) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.chatList}>
      {/* 头部区域 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          消息
        </h1>
        
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
      <div className={`${styles.chatListContent} ${styles.listContainer}`}>
        {filteredUsers.length === 0 ? (
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
          </div>
        )}
      </div>
    </div>
  )
} 