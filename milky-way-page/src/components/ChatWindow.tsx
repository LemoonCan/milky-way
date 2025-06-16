import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './MessageBubble'
import { Avatar } from './Avatar'
import { Smile, Paperclip, Send } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import type { ChatUser } from '@/store/chat'

interface ChatWindowProps {
  currentUser: ChatUser | null
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser }) => {
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { getChatMessages, addMessage } = useChatStore()

  const messages = currentUser ? getChatMessages(currentUser.id) : []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim() || !currentUser) return

    addMessage(currentUser.id, {
      content: inputValue.trim(),
      sender: 'me',
      timestamp: new Date(),
      type: 'text',
    })

    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  if (!currentUser) {
    return (
      <div className="wechat-chat-window">
        {/* <div style={{ 
          flex: '1', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 12px',
              backgroundColor: '#e5e7eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '24px' }}>💬</span>
            </div>
            <h3 style={{ 
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px',
              color: 'var(--wechat-text)' 
            }}>
              选择一个聊天
            </h3>
            <p style={{ 
              color: 'var(--wechat-text-light)',
              fontSize: '14px'
            }}>
              从左侧选择一个联系人开始聊天
            </p>
          </div>
        </div> */}
      </div>
    )
  }

  return (
    <div className="wechat-chat-window">
      {/* 聊天头部 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        backgroundColor: 'var(--wechat-chat-list-bg)',
        borderBottom: '1px solid var(--wechat-border)',
        boxShadow: 'var(--wechat-shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            size={40}
            userId={currentUser.id}
            style={{
              boxShadow: 'var(--wechat-shadow)'
            }}
          />
          <div style={{ marginLeft: '12px' }}>
            <h2 style={{ 
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--wechat-text)',
              letterSpacing: '-0.3px',
              margin: 0,
              lineHeight: '20px'
            }}>
              {currentUser.name}
            </h2>
            <p style={{
              fontSize: '12px',
              color: 'var(--wechat-text-light)',
              margin: 0,
              lineHeight: '14px'
            }}>
              {currentUser.online ? '在线' : '离线'}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--wechat-chat-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--wechat-text-light)" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 聊天消息区域 */}
      <div style={{
        flex: '1',
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            userId={currentUser.id}
            userName={currentUser.name}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入工具栏 */}
      <div style={{
        padding: '16px 24px 20px',
        backgroundColor: 'var(--wechat-chat-list-bg)',
        borderTop: '1px solid var(--wechat-border)',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--wechat-chat-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Smile style={{ width: '20px', height: '20px', color: 'var(--wechat-text-light)' }} />
            </div>
            <div style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--wechat-chat-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Paperclip style={{ width: '20px', height: '20px', color: 'var(--wechat-text-light)' }} />
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--wechat-chat-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--wechat-text-light)" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--wechat-chat-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--wechat-text-light)" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '16px'
        }}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            style={{ 
              flex: '1',
              resize: 'none',
              border: '2px solid var(--wechat-border)',
              borderRadius: '20px',
              padding: '12px 16px',
              fontSize: '14px',
              outline: 'none',
              minHeight: '44px',
              maxHeight: '120px',
              transition: 'all 0.2s ease',
              backgroundColor: 'white',
              color: 'var(--wechat-text)',
              lineHeight: '1.4',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.03)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--wechat-primary)'
              e.target.style.boxShadow = '0 0 0 3px rgba(252, 214, 108, 0.15), inset 0 1px 3px rgba(0, 0, 0, 0.03)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--wechat-border)'
              e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.03)'
            }}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            style={{ 
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: !inputValue.trim() ? 0.4 : 1,
              backgroundColor: inputValue.trim() ? 'var(--wechat-primary)' : 'var(--wechat-text-light)',
              color: inputValue.trim() ? '#333' : 'white',
              border: 'none',
              cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              boxShadow: inputValue.trim() ? '0 2px 8px rgba(252, 214, 108, 0.4)' : 'none',
              transform: inputValue.trim() ? 'scale(1)' : 'scale(0.95)'
            }}
                         onMouseEnter={(e) => {
               if (inputValue.trim()) {
                 e.currentTarget.style.transform = 'scale(1.05)'
                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(252, 214, 108, 0.5)'
               }
             }}
             onMouseLeave={(e) => {
               if (inputValue.trim()) {
                 e.currentTarget.style.transform = 'scale(1)'
                 e.currentTarget.style.boxShadow = '0 2px 8px rgba(252, 214, 108, 0.4)'
               }
             }}
          >
            <Send style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        
        <div style={{ 
          marginTop: '8px',
          fontSize: '12px',
          color: 'var(--wechat-text-light)' 
        }}>
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>
    </div>
  )
} 