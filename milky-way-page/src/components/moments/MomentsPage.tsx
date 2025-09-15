import React, { useEffect, useState } from 'react'
import { RefreshCw, Edit3, Grape, Citrus } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar } from '../Avatar'
import { MomentsList } from './MomentsList'
import { MomentPublishDialog } from './MomentPublishDialog'
import NotificationButton from '../NotificationButton'
import NotificationPanel from '../NotificationPanel'
import { useMomentStore } from '../../store/moment'
import { useUserStore } from '../../store/user'
import { useNotificationStore } from '../../store/notification'
import styles from '../../css/moments/MomentsPage.module.css'
import { EmojiText } from '../EmojiText'

export const MomentsPage: React.FC = () => {
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const { 
    moments, 
    loading, 
    error, 
    hasNext,
    momentType,
    initialized,
    fetchMoments, 
    fetchMyMoments,
    loadMoreMoments, 
    refreshMoments,
    setMomentType
  } = useMomentStore()
  
  const { currentUser, fetchUserInfo } = useUserStore()
  
  const { 
    isNotificationPanelOpen, 
    toggleNotificationPanel, 
    closeNotificationPanel,
    getMomentStats,
    getMomentNotifications
  } = useNotificationStore()
  
  // 获取朋友圈专用的通知统计和通知列表
  const momentStats = getMomentStats()
  const momentNotifications = getMomentNotifications()

  // 初始化加载
  useEffect(() => {
    fetchUserInfo()
    // 默认显示好友动态
    setMomentType('friends')
    fetchMoments()
  }, [fetchUserInfo, setMomentType, fetchMoments])

  // 处理动态类型切换
  const handleMomentTypeChange = async (type: 'friends' | 'mine') => {
    if (type === momentType) return
    
    setMomentType(type)
    if (type === 'mine') {
      await fetchMyMoments()
    } else {
      await fetchMoments()
    }
  }


  // 刷新动态
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshMoments()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className={styles.momentsPage}>
      {/* 封面背景区域 */}
      <div className={styles.coverSection}>
        <div className={styles.coverBackground}>
          {/* 左上角动态类型切换按钮 */}
          <div className={styles.topLeftActions}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMomentTypeChange('friends')}
              className={`${styles.iconButton} ${momentType === 'friends' ? styles.active : ''}`}
              title="好友动态"
            >
              <Grape size={20} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMomentTypeChange('mine')}
              className={`${styles.iconButton} ${momentType === 'mine' ? styles.active : ''}`}
              title="我的动态"
            >
              <Citrus size={20} />
            </Button>
          </div>
          
          {/* 右上角操作按钮 */}
          <div className={styles.topActions}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`${styles.iconButton} ${isRefreshing || loading ? styles.rotating : ''}`}
            >
              <RefreshCw size={20} />
            </Button>
            
            <NotificationButton
              className={styles.iconButton}
              onClick={toggleNotificationPanel}
              customStats={momentStats}
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPublishDialog(true)}
              className={styles.iconButton}
            >
              <Edit3 size={20} />
            </Button>
          </div>
          
          {/* 用户信息 - 右下角 */}
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                <EmojiText text={currentUser?.nickName || '未登录'} size="1em" />
              </span>
            </div>
            <Avatar
              size={64}
              userId={currentUser?.id}
              avatarUrl={currentUser?.avatar}
              className={styles.userAvatar}
            />
          </div>
        </div>
      </div>

      {/* 动态列表 */}
      <MomentsList
        moments={moments}
        loading={loading}
        hasNext={hasNext}
        initialized={initialized}
        error={error}
        onLoadMore={loadMoreMoments}
        onPublish={() => setShowPublishDialog(true)}
      />

      {/* 发布动态对话框 */}
      <MomentPublishDialog
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
      />

      {/* 通知面板  */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={closeNotificationPanel}
        customNotifications={momentNotifications}
        customStats={momentStats}
        title="动态通知"
      />

      {/* 错误提示现在由全局处理，这里不再需要 */}
    </div>
  )
} 