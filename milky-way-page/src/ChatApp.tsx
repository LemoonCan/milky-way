import { useState } from 'react'
import { SidebarNav } from './components/SidebarNav'
import { ChatList } from './components/ChatList'
import { ChatWindow } from './components/ChatWindow'
import { useChatStore } from './store/chat'
import { useAuthStore } from './store/auth'
import styles from './css/App.module.css'
import chatWindowStyles from './css/ChatWindow.module.css'

function ChatApp() {
  const [activeTab, setActiveTab] = useState('messages')
  const { chatUsers, currentChatId, setCurrentChat } = useChatStore()
  const { logout, currentUser } = useAuthStore()

  const currentUser_chat = chatUsers.find((user) => user.id === currentChatId) || null

  const handleSelectChat = (userId: string) => {
    setCurrentChat(userId)
  }

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      // 页面会由AppRouter处理重定向
    }
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'messages':
        return (
          <div className={styles.mainContent}>
            <ChatList 
              onSelectChat={handleSelectChat}
              selectedChatId={currentChatId}
            />
            <ChatWindow currentUser={currentUser_chat} />
          </div>
        )
      case 'friends':
        return (
          <div className={`${chatWindowStyles.chatWindowBase} ${styles.emptyState}`}>
            <div className={styles.emptyStateInner}>
              <div className={styles.emptyStateContent}>
                <div className={styles.emptyStateIcon}>
                  <span style={{ fontSize: '24px' }}>👥</span>
                </div>
                <h3 className={styles.emptyStateTitle}>
                  好友功能
                </h3>
                <p className={styles.emptyStateDesc}>
                  好友管理功能正在开发中...
                </p>
              </div>
            </div>
          </div>
        )
      case 'moments':
        return (
          <div className={`${chatWindowStyles.chatWindowBase} ${styles.emptyState}`}>
            <div className={styles.emptyStateInner}>
              <div className={styles.emptyStateContent}>
                <div className={styles.emptyStateIcon}>
                  <span style={{ fontSize: '24px' }}>📷</span>
                </div>
                <h3 className={styles.emptyStateTitle}>
                  朋友圈功能
                </h3>
                <p className={styles.emptyStateDesc}>
                  朋友圈功能正在开发中...
                </p>
              </div>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className={`${chatWindowStyles.chatWindowBase} ${styles.emptyState}`}>
            <div className={styles.emptyStateInner}>
              <div className={styles.emptyStateContent}>
                <div className={styles.emptyStateIcon}>
                  <span style={{ fontSize: '24px' }}>⚙️</span>
                </div>
                <h3 className={styles.emptyStateTitle}>
                  设置功能
                </h3>
                <p className={styles.emptyStateDesc}>
                  设置功能正在开发中...
                </p>
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ff4757',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    退出登录
                  </button>
                </div>
                {currentUser && (
                  <div style={{ 
                    marginTop: '16px', 
                    fontSize: '12px', 
                    color: 'var(--milky-text-light)' 
                  }}>
                    当前用户：{currentUser.nickname} (@{currentUser.username})
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="milky-container">
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

export default ChatApp 