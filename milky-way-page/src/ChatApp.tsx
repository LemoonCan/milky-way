import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { SidebarNav } from './components/SidebarNav'
import { ChatList } from './components/ChatList'
import { ChatWindow } from './components/ChatWindow'
import { SettingsPage } from './components/SettingsPage'
import { ProfilePage } from './components/ProfilePage'
import { FriendPage } from './components/FriendPage'
import { useChatStore } from './store/chat'
import { useUserStore } from './store/user'
import styles from './css/App.module.css'
import chatWindowStyles from './css/ChatWindow.module.css'

function ChatApp() {
  const [showProfile, setShowProfile] = useState(false)
  const { chatUsers, currentChatId, setCurrentChat } = useChatStore()
  const { fetchUserInfo } = useUserStore()
  const location = useLocation()
  const navigate = useNavigate()

  // 应用启动时获取用户信息
  useEffect(() => {
    fetchUserInfo()
  }, [fetchUserInfo])

  // 根据当前路径确定激活的标签
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/messages')) return 'messages'
    if (path.includes('/friends')) return 'friends'
    if (path.includes('/moments')) return 'moments'
    if (path.includes('/settings')) return 'settings'
    return 'messages'
  }

  const currentUser_chat = chatUsers.find((user) => user.id === currentChatId) || null

  const handleSelectChat = (userId: string) => {
    setCurrentChat(userId)
  }

  const handleNavigateToProfile = () => {
    setShowProfile(true)
  }

  const handleBackFromProfile = () => {
    setShowProfile(false)
  }

  const handleTabChange = (tab: string) => {
    navigate(`/main/${tab}`)
  }

  // 消息页面组件
  const MessagesPage = () => (
    <div className={styles.mainContent}>
      <ChatList 
        onSelectChat={handleSelectChat}
        selectedChatId={currentChatId}
      />
      <ChatWindow currentUser={currentUser_chat} />
    </div>
  )

  // 朋友圈页面组件
  const MomentsPage = () => (
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

  // 设置页面组件
  const SettingsPageWrapper = () => {
    if (showProfile) {
      return (
        <div className={chatWindowStyles.chatWindowBase}>
          <ProfilePage onBack={handleBackFromProfile} />
        </div>
      )
    }
    return (
      <div className={chatWindowStyles.chatWindowBase}>
        <SettingsPage onNavigateToProfile={handleNavigateToProfile} />
      </div>
    )
  }

  return (
    <div className="milky-container">
      {/* 左侧导航栏 */}
      <SidebarNav 
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
      />
      
      {/* 主要内容区域 - 使用路由 */}
      <Routes>
        <Route path="/" element={<Navigate to="/main/messages" replace />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/friends" element={<FriendPage />} />
        <Route path="/moments" element={<MomentsPage />} />
        <Route path="/settings" element={<SettingsPageWrapper />} />
        <Route path="*" element={<Navigate to="/main/messages" replace />} />
      </Routes>
    </div>
  )
}

export default ChatApp 