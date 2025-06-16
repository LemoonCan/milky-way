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
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '3px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isActive ? 'var(--wechat-border-light)' : undefined,
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'var(--wechat-border-light)'
          e.currentTarget.style.transform = 'translateX(1px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.transform = 'translateX(0)'
        }
      }}
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
              bottom: '-4px',
              right: '-4px',
              width: '16px',
              height: '16px',
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
              top: '-6px',
              right: '-6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '20px',
              height: '20px',
              padding: '0 4px',
              fontSize: '12px',
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
      
      <div style={{ 
        marginLeft: '16px', 
        flex: '1', 
        minWidth: '0' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'baseline', 
          marginBottom: '0px' 
        }}>
          <h3 
            style={{ 
              fontSize: '16px',
              fontWeight: '600',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'var(--wechat-text)',
              letterSpacing: '-0.3px'
            }}
          >
            {user.name}
          </h3>
          <span 
            style={{ 
              fontSize: '12px',
              marginLeft: '8px',
              flexShrink: 0,
              color: 'var(--wechat-text-secondary)',
              fontWeight: '500'
            }}
          >
            {formatTime(user.lastMessageTime)}
          </span>
        </div>
        <p 
          style={{ 
            fontSize: '14px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '1.4',
            color: 'var(--wechat-text-light)',
            marginTop: '0px'
          }}
        >
          {user.lastMessage}
        </p>
      </div>

    </div>
  )
} 