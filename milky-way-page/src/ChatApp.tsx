import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { SidebarNav } from './components/SidebarNav'
import { ChatList } from './components/ChatList'
import { ChatWindow } from './components/ChatWindow'
import { SettingsPage } from './components/SettingsPage'
import { ProfilePage } from './components/ProfilePage'
import { FriendPage } from './components/FriendPage'
import { WebSocketTest } from './components/WebSocketTest'
import { useChatStore, type ChatUser } from './store/chat'
import { useUserStore } from './store/user'
import { useAuthStore } from './store/auth'
import styles from './css/App.module.css'
import chatWindowStyles from './css/ChatWindow.module.css'

// 将页面组件移到外部以避免重新创建导致的组件重新挂载问题
const MessagesPage = ({ 
  onSelectChat, 
  selectedChatId, 
  currentUser 
}: { 
  onSelectChat: (userId: string) => void
  selectedChatId: string | null
  currentUser: ChatUser | null
}) => (
  <div className={styles.mainContent}>
    <ChatList 
      onSelectChat={onSelectChat}
      selectedChatId={selectedChatId}
    />
    <ChatWindow currentUser={currentUser} />
  </div>
)

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

const SettingsPageWrapper = ({ 
  showProfile, 
  onNavigateToProfile, 
  onBackFromProfile 
}: { 
  showProfile: boolean
  onNavigateToProfile: () => void
  onBackFromProfile: () => void
}) => {
  if (showProfile) {
    return (
      <div className={chatWindowStyles.chatWindowBase}>
        <ProfilePage onBack={onBackFromProfile} />
      </div>
    )
  }
  return (
    <div className={chatWindowStyles.chatWindowBase}>
      <SettingsPage onNavigateToProfile={onNavigateToProfile} />
    </div>
  )
}

function ChatApp() {
  const [showProfile, setShowProfile] = useState(false)
  const { chatUsers, currentChatId, setCurrentChat, initializeChatService, isConnected } = useChatStore()
  const { fetchUserInfo } = useUserStore()
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  // 应用启动时获取用户信息 - 只执行一次
  useEffect(() => {
    fetchUserInfo().catch(error => {
      console.warn('获取用户信息失败:', error)
      // 用户信息获取失败不影响应用正常使用
    })
  }, []) // 移除依赖，只在组件挂载时执行一次

  // 用户登录后初始化WebSocket连接
  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      initializeChatService().catch(error => {
        console.error('初始化聊天服务失败:', error)
      })
    }
  }, [isAuthenticated, isConnected, initializeChatService])

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
        <Route path="/messages" element={
          <MessagesPage 
            onSelectChat={handleSelectChat}
            selectedChatId={currentChatId}
            currentUser={currentUser_chat}
          />
        } />
        <Route path="/friends" element={<FriendPage />} />
        <Route path="/moments" element={<MomentsPage />} />
        <Route path="/settings" element={
          <SettingsPageWrapper 
            showProfile={showProfile}
            onNavigateToProfile={handleNavigateToProfile}
            onBackFromProfile={handleBackFromProfile}
          />
        } />
        <Route path="/websocket-test" element={<WebSocketTest />} />
        <Route path="*" element={<Navigate to="/main/messages" replace />} />
      </Routes>
    </div>
  )
}

export default ChatApp 