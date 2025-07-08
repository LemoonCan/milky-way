import React, { useState } from 'react'
import { Button } from '../ui/button'
import { User, LogOut, ChevronRight, Bell, Palette, Shield } from 'lucide-react'
import { ConfirmDialog } from '../ui/confirm-dialog'
import { useAuthStore } from '../../store/auth'
import styles from '../../css/settings/SettingsPage.module.css'

interface SettingsPageProps {
  onNavigateToProfile: () => void
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateToProfile }) => {
  const { logout } = useAuthStore()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = () => {
    setShowLogoutDialog(true)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutDialog(false)
    // 页面会由AppRouter处理重定向
  }

  const cancelLogout = () => {
    setShowLogoutDialog(false)
  }

  const settingsItems = [
    {
      id: 'profile',
      icon: User,
      label: '个人信息',
      description: '管理头像、昵称等个人资料',
      onClick: onNavigateToProfile
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 页面标题 */}
        <div className={styles.header}>
          <h1 className={styles.title}>设置</h1>
        </div>

        {/* 设置选项列表 */}
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>账户设置</h2>
          <div className={styles.settingsList}>
            {settingsItems.map((item) => (
              <div
                key={item.id}
                className={styles.settingsItem}
                onClick={item.onClick}
              >
                <div className={styles.itemIcon}>
                  <item.icon className={styles.icon} />
                </div>
                <div className={styles.itemContent}>
                  <h3 className={styles.itemTitle}>{item.label}</h3>
                  <p className={styles.itemDescription}>{item.description}</p>
                </div>
                <ChevronRight className={styles.chevronIcon} />
              </div>
            ))}
          </div>
        </div>

        {/* 其他设置 */}
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>其他</h2>
          <div className={styles.settingsList}>
            <div className={styles.settingsItem} style={{ cursor: 'default' }}>
              <div className={styles.itemIcon}>
                <Bell className={styles.icon} />
              </div>
              <div className={styles.itemContent}>
                <h3 className={styles.itemTitle}>通知设置</h3>
                <p className={styles.itemDescription}>管理推送通知和提醒</p>
              </div>
              <div className={styles.comingSoon}>即将推出</div>
            </div>

            <div className={styles.settingsItem} style={{ cursor: 'default' }}>
              <div className={styles.itemIcon}>
                <Palette className={styles.icon} />
              </div>
              <div className={styles.itemContent}>
                <h3 className={styles.itemTitle}>主题设置</h3>
                <p className={styles.itemDescription}>选择你喜欢的界面主题</p>
              </div>
              <div className={styles.comingSoon}>即将推出</div>
            </div>

            <div className={styles.settingsItem} style={{ cursor: 'default' }}>
              <div className={styles.itemIcon}>
                <Shield className={styles.icon} />
              </div>
              <div className={styles.itemContent}>
                <h3 className={styles.itemTitle}>隐私设置</h3>
                <p className={styles.itemDescription}>管理隐私和安全选项</p>
              </div>
              <div className={styles.comingSoon}>即将推出</div>
            </div>
          </div>
        </div>

        {/* 退出登录按钮 */}
        <div className={styles.logoutSection}>
          <Button
            onClick={handleLogout}
            variant="outline"
            className={styles.logoutButton}
          >
            <LogOut className={styles.logoutIcon} />
            退出登录
          </Button>
        </div>
      </div>
      
      {/* 退出登录确认对话框 */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="退出登录"
        message=""
        confirmText="退出登录"
        cancelText="取消"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </div>
  )
} 