import React, { useState } from 'react'
import { ChatListItem } from './ChatListItem'
import { Search } from 'lucide-react'
import { useChatStore } from '@/store/chat'

interface ChatListProps {
  onSelectChat: (userId: string) => void
  selectedChatId: string | null
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { chatUsers } = useChatStore()

  const filteredUsers = chatUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="wechat-chat-list">
              {/* 头部区域 */}
        <div style={{ 
          padding: '20px 20px 16px', 
          backgroundColor: 'var(--wechat-chat-list-bg)'
        }}>
        <h1 style={{ 
          fontSize: '22px', 
          fontWeight: '600', 
          marginBottom: '16px', 
          color: 'var(--wechat-text)',
          letterSpacing: '-0.5px'
        }}>
          消息
        </h1>
        
        {/* 搜索框 */}
        <div style={{ position: 'relative' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '14px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            width: '18px', 
            height: '18px', 
            color: 'var(--wechat-text-light)' 
          }} />
          <input
            type="text"
            placeholder="搜索聊天记录"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%',
              paddingLeft: '44px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              borderRadius: '20px',
              outline: 'none',
              fontSize: '14px',
              transition: 'all 0.2s',
              backgroundColor: 'var(--wechat-chat-bg)',
              color: 'var(--wechat-text)',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.03)',
              border: '1px solid transparent'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff'
              e.target.style.boxShadow = '0 0 0 2px rgba(252, 214, 108, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.03)'
              e.target.style.borderColor = 'var(--wechat-primary)'
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'var(--wechat-chat-bg)'
              e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.03)'
              e.target.style.borderColor = 'transparent'
            }}
          />
        </div>
      </div>

      {/* 聊天列表 */}
      <div className="wechat-chat-list-content" style={{ flex: '1', overflowY: 'auto' }}>
        {filteredUsers.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '128px', 
            color: 'var(--wechat-text-light)' 
          }}>
            {searchQuery ? '未找到匹配的聊天' : '暂无聊天记录'}
          </div>
        ) : (
          <div>
            {filteredUsers.map((user) => (
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