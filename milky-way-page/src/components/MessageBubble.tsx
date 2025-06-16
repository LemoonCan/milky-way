import React from 'react'
import { Avatar } from './Avatar'
import type { Message } from '@/store/chat'

interface MessageBubbleProps {
  message: Message
  userId?: string
  userName?: string
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  userId,
  userName,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isFromMe = message.sender === 'me'

  return (
    <div style={{
      display: 'flex',
      marginBottom: '16px',
      justifyContent: isFromMe ? 'flex-end' : 'flex-start'
    }}>
      {!isFromMe && (
        <div style={{ flexShrink: 0, marginRight: '12px' }}>
          <Avatar 
            size={32}
            userId={userId || 'other-user'}
          />
        </div>
      )}
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '360px',
        alignItems: isFromMe ? 'flex-end' : 'flex-start'
      }}>
        <div
          className={`wechat-message-bubble ${isFromMe ? 'sent' : 'received'}`}
        >
          <p style={{
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: '1.4',
            margin: 0
          }}>
            {message.content}
          </p>
        </div>
        <span style={{
          fontSize: '12px',
          marginTop: '4px',
          color: 'var(--wechat-text-light)'
        }}>
          {formatTime(message.timestamp)}
        </span>
      </div>
      
      {isFromMe && (
        <div style={{ flexShrink: 0, marginLeft: '12px' }}>
          <Avatar 
            size={32}
            userId="current-user"
          />
        </div>
      )}
    </div>
  )
} 