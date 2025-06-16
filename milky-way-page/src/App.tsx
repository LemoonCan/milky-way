import React, { useState } from 'react'
import { SidebarNav } from './components/SidebarNav'
import { ChatList } from './components/ChatList'
import { ChatWindow } from './components/ChatWindow'
import { useChatStore } from './store/chat'

function App() {
  const [activeTab, setActiveTab] = useState('messages')
  const { chatUsers, currentChatId, setCurrentChat } = useChatStore()

  const currentUser = chatUsers.find(user => user.id === currentChatId) || null

  const handleSelectChat = (userId: string) => {
    setCurrentChat(userId)
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'messages':
        return (
          <div style={{ display: 'flex', flex: '1' }}>
            <ChatList 
              onSelectChat={handleSelectChat}
              selectedChatId={currentChatId}
            />
            <ChatWindow currentUser={currentUser} />
          </div>
        )
      case 'friends':
        return (
          <div className="wechat-chat-window" style={{ flex: '1' }}>
            <div style={{ 
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
                  <span style={{ fontSize: '24px' }}>👥</span>
                </div>
                <h3 style={{ 
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: 'var(--wechat-text)' 
                }}>
                  好友功能
                </h3>
                <p style={{ 
                  color: 'var(--wechat-text-light)',
                  fontSize: '14px'
                }}>
                  好友管理功能正在开发中...
                </p>
              </div>
            </div>
          </div>
        )
      case 'moments':
        return (
          <div className="wechat-chat-window" style={{ flex: '1' }}>
            <div style={{ 
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
                  <span style={{ fontSize: '24px' }}>📷</span>
                </div>
                <h3 style={{ 
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: 'var(--wechat-text)' 
                }}>
                  朋友圈功能
                </h3>
                <p style={{ 
                  color: 'var(--wechat-text-light)',
                  fontSize: '14px'
                }}>
                  朋友圈功能正在开发中...
                </p>
              </div>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="wechat-chat-window" style={{ flex: '1' }}>
            <div style={{ 
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
                  <span style={{ fontSize: '24px' }}>⚙️</span>
                </div>
                <h3 style={{ 
                  fontSize: '16px',
                  fontWeight: '500',
                  marginBottom: '8px',
                  color: 'var(--wechat-text)' 
                }}>
                  设置功能
                </h3>
                <p style={{ 
                  color: 'var(--wechat-text-light)',
                  fontSize: '14px'
                }}>
                  设置功能正在开发中...
                </p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="wechat-container">
      {/* 左侧导航栏 */}
      <SidebarNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* 主要内容区域 */}
      {renderMainContent()}
    </div>
  )
}

export default App
