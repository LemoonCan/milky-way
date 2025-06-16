import React from 'react'
import { MessageCircle, Users, Camera, Settings } from 'lucide-react'
import { Avatar } from './Avatar'

interface SidebarNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'messages', icon: MessageCircle, label: '消息' },
    { id: 'friends', icon: Users, label: '好友' },
    { id: 'moments', icon: Camera, label: '朋友圈' },
  ]

  return (
    <div className="wechat-sidebar">
            {/* 用户头像 */}
      <Avatar 
        size={48}
        userId="current-user"
        style={{
          marginBottom: '24px',
          border: '2px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
      />

      {/* 上部导航按钮 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        marginBottom: 'auto'
      }}>
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`wechat-sidebar-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={item.label}
          >
            <item.icon style={{ width: '24px', height: '24px', color: '#666' }} />
          </div>
        ))}
      </div>

      {/* 底部设置按钮 */}
      <div
        className={`wechat-sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
        title="设置"
      >
        <Settings style={{ width: '24px', height: '24px', color: '#666' }} />
      </div>
    </div>
  )
} 