import React, { useEffect, useState } from 'react'
import { MessageCircle, Users, Cherry, Settings } from 'lucide-react'
import { Avatar } from './Avatar'
import { userService } from '../services/user'
import type { User } from '../types/api'
import styles from '../css/SidebarNav.module.css'

interface SidebarNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, onTabChange }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // 获取当前用户信息
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await userService.getUserInfo()
        if (response.success && response.data) {
          setCurrentUser(response.data)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    loadCurrentUser()
  }, [])
  const navItems = [
    { id: 'messages', icon: MessageCircle, label: '消息' },
    { id: 'friends', icon: Users, label: '好友' },
    { id: 'moments', icon: Cherry, label: '朋友圈' },
  ]

  return (
    <div className={styles.sidebar}>
      {/* 用户头像 */}
      <Avatar 
        size={48}
        userId={currentUser?.openId || "current-user"}
        avatarUrl={currentUser?.avatar}
        className={styles.userAvatar}
      />

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
    </div>
  )
} 