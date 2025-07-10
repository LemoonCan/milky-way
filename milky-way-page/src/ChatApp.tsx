import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { SidebarNav } from './components/SidebarNav'
import { ChatList } from './components/chats/ChatList'
import { ChatWindow } from './components/chats/ChatWindow'
import { SettingsPage } from './components/settings/SettingsPage'
import { ProfilePage } from './components/settings/ProfilePage'
import { FriendPage } from './components/friends/FriendPage'
import { MomentsPage as MomentsPageComponent } from './components/moments/MomentsPage'
import { UserMomentsPage } from './components/moments/UserMomentsPage'
import { MomentDetailPage } from './components/moments/MomentDetailPage'

import { useChatStore, type ChatUser } from './store/chat'
import { useUserStore } from './store/user'
import { useAuthStore } from './store/auth'
import { useWebSocketNotifications } from './hooks/useWebSocketNotifications'
import styles from './css/App.module.css'
import chatWindowStyles from './css/chats/ChatWindow.module.css'

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

  // 初始化WebSocket通知系统
  useWebSocketNotifications()

  // 应用启动时获取用户信息 - 只执行一次
  useEffect(() => {
    fetchUserInfo().catch(error => {
      console.warn('获取用户信息失败:', error)
      // 用户信息获取失败不影响应用正常使用
    })
  }, [fetchUserInfo]) // 添加fetchUserInfo依赖，但由于useUserStore的稳定性，实际上不会重复调用

  // 用户登录后初始化WebSocket连接 - 改进逻辑
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[ChatApp] 用户已认证，初始化聊天服务，当前连接状态:', isConnected)
      initializeChatService().catch(error => {
        console.error('初始化聊天服务失败:', error)
      })
    }
  }, [isAuthenticated, initializeChatService]) // 移除isConnected依赖，避免重复初始化

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
        <Route path="/moments" element={<MomentsPageComponent />} />
        <Route path="/moments/user/:userId" element={<UserMomentsPage />} />
        <Route path="/moments/detail/:momentId" element={<MomentDetailPage />} />
        <Route path="/settings" element={
          <SettingsPageWrapper 
            showProfile={showProfile}
            onNavigateToProfile={handleNavigateToProfile}
            onBackFromProfile={handleBackFromProfile}
          />
        } />

        <Route path="*" element={<Navigate to="/main/messages" replace />} />
      </Routes>
    </div>
  )
}

export default ChatApp 