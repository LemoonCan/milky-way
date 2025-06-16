import React from 'react'
import { Avatar } from './Avatar'
import type { ChatUser } from '@/store/chat'

interface ChatListItemProps {
  user: ChatUser
  isActive: boolean
  onClick: () => void
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  user,
  isActive,
  onClick,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}小时前`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}天前`
    }
  }

  return (
    <div
      className={`wechat-chat-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar 
          size={48}
          userId={user.id}
          style={{
            boxShadow: 'var(--wechat-shadow)'
          }}
        />
        {user.online && (
          <div 
            style={{ 
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '14px',
              height: '14px',
              border: '2px solid white',
              borderRadius: '50%',
              backgroundColor: 'var(--wechat-primary)'
            }}
          ></div>
        )}
        {user.unreadCount > 0 && (
          <div 
            style={{ 
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '18px',
              height: '18px',
              padding: '0 3px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'white',
              borderRadius: '50%',
              backgroundColor: '#FF4757',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
              zIndex: 10
            }}
          >
            {user.unreadCount > 99 ? '99+' : user.unreadCount}
          </div>
        )}
      </div>
      
      <div className="wechat-chat-item-content">
        <div className="wechat-chat-item-header">
          <h3 className="wechat-chat-item-name">
            {user.name}
          </h3>
          <span className="wechat-chat-item-time">
            {formatTime(user.lastMessageTime)}
          </span>
        </div>
        <p className="wechat-chat-item-message">
          {user.lastMessage}
        </p>
      </div>

    </div>
  )
} 