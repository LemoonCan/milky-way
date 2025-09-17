import React, { useEffect, useState, useRef } from 'react'
import { MessageCircle, Users, Cherry, Settings } from 'lucide-react'
import { Avatar } from './Avatar'
import { ProfileModal } from './ProfileModal'
import { useUserStore } from '../store/user'
import { ImageUtils } from './LazyImage'
import { useIsMobile } from '../hooks/useIsMobile'
import styles from '../css/SidebarNav.module.css'

interface SidebarNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, onTabChange }) => {
  const { currentUser } = useUserStore()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // 预加载当前用户头像
  useEffect(() => {
    const preloadAvatar = async () => {
      if (currentUser?.avatar) {
        try {
          await ImageUtils.preloadImages([currentUser.avatar])
        } catch (error) {
          console.error('预加载头像失败:', error)
        }
      }
    }

    preloadAvatar()
  }, [currentUser?.avatar])
  const navItems = [
    { id: 'messages', icon: MessageCircle, label: '消息' },
    { id: 'friends', icon: Users, label: '好友' },
    { id: 'moments', icon: Cherry, label: '动态' },
  ]

  const handleAvatarClick = () => {
    setShowProfileModal(true)
  }

  const handleCloseProfileModal = () => {
    setShowProfileModal(false)
  }

  // 移动端布局
  if (isMobile) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.mobileNavContainer}>
          {/* 导航按钮 */}
          <div className={styles.mobileNavCenter}>
            {navItems.map((item) => (
              <div
                key={item.id}
                className={`${styles.sidebarBtn} ${activeTab === item.id ? styles.active : ''}`}
                onClick={() => onTabChange(item.id)}
                title={item.label}
              >
                <item.icon className={styles.navIcon} />
              </div>
            ))}
            
            {/* 设置按钮 */}
            <div
              className={`${styles.sidebarBtn} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => onTabChange('settings')}
              title="设置"
            >
              <Settings className={styles.navIcon} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 桌面端布局（保持原有逻辑）
  return (
    <div className={styles.sidebar}>
      {/* 用户头像 */}
      <div ref={avatarRef} onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
        <Avatar 
          size={48}
          userId={currentUser?.id || "current-user"}
          avatarUrl={currentUser?.avatar}
          className={styles.userAvatar}
        />
      </div>

      {/* 上部导航按钮 */}
      <div className={styles.navSection}>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.sidebarBtn} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
            title={item.label}
          >
            <item.icon className={styles.navIcon} />
          </div>
        ))}
      </div>

      {/* 底部设置按钮 */}
      <div
        className={`${styles.sidebarBtn} ${activeTab === 'settings' ? styles.active : ''}`}
        onClick={() => onTabChange('settings')}
        title="设置"
      >
        <Settings className={styles.navIcon} />
      </div>

      {/* 个人信息弹框 */}
      {currentUser && (
        <ProfileModal
          userId={currentUser.id}
          isVisible={showProfileModal}
          onClose={handleCloseProfileModal}
          triggerElement={avatarRef.current}
          showActions={false}
        />
      )}
    </div>
  )
} 