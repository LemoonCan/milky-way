import React, { useEffect, useState, useRef, useCallback } from 'react'
import { RefreshCw, Edit3, Grape, Citrus } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar } from '../Avatar'
import { MomentItem } from './MomentItem'
import { MomentPublishDialog } from './MomentPublishDialog'
import NotificationButton from '../NotificationButton'
import NotificationPanel from '../NotificationPanel'
import { useMomentStore } from '../../store/moment'
import { useUserStore } from '../../store/user'
import { useNotificationStore } from '../../store/notification'
import styles from '../../css/moments/MomentsPage.module.css'

export const MomentsPage: React.FC = () => {
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const momentsListRef = useRef<HTMLDivElement>(null)
  
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
    setMomentType,
    clearError 
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
  }, [])

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

  // 无限滚动处理
  const handleScroll = useCallback(() => {
    const scrollContainer = momentsListRef.current
    if (!scrollContainer || loading || !hasNext) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer
    // 当滚动到底部附近时（距离底部100px）触发加载
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMoreMoments()
    }
  }, [loading, hasNext, loadMoreMoments])

  // 监听滚动事件
  useEffect(() => {
    const scrollContainer = momentsListRef.current
    if (!scrollContainer) return

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

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
                {currentUser?.nickName || '未登录'}
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
      <div className={styles.momentsList} ref={momentsListRef}>
        <div className={styles.momentsListInner}>
          {/* 动态条目 */}
          {moments.map((moment) => (
            <MomentItem key={moment.id} moment={moment} />
          ))}

          {/* 没有更多数据 */}
          {!hasNext && moments.length > 0 && (
            <div className={styles.noMore}>
              <span>没有更多动态了</span>
            </div>
          )}

          {/* 空状态 - 只有在已初始化且非加载状态且动态确实为空时才显示 */}
          {initialized && !loading && moments.length === 0 && !error && (
            <div className={styles.empty}>
              <Edit3 size={48} className={styles.emptyIcon} />
              <h3>还没有动态</h3>
              <p>发布第一条动态，分享你的生活吧！</p>
              <Button 
                onClick={() => setShowPublishDialog(true)}
                className={styles.publishButton}
              >
                <Edit3 size={16} />
                发布动态
              </Button>
            </div>
          )}
        </div>
      </div>

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

      {/* 错误提示 */}
      {error && (
        <div className={styles.errorToast}>
          <span>{error}</span>
          <button onClick={clearError} className={styles.errorCloseBtn}>
            ×
          </button>
        </div>
      )}
    </div>
  )
} 