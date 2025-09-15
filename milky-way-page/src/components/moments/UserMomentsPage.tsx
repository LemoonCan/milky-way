import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { RefreshCw, Undo2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar } from '../Avatar'
import { MomentsList } from './MomentsList'
import { MomentPublishDialog } from './MomentPublishDialog'
import { useUserMomentStore } from '../../store/userMoment'
import { useUserStore } from '../../store/user'
import type { UserDetailInfo } from '../../services/user'
import styles from '../../css/moments/UserMomentsPage.module.css'
import { EmojiText } from '../EmojiText'

// 路由状态类型定义
interface LocationState {
  userInfo?: UserDetailInfo
}

export const UserMomentsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [targetUser, setTargetUser] = useState<UserDetailInfo | null>(null)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  
  // 从路由状态中获取用户信息
  const userInfoFromState = (location.state as LocationState)?.userInfo
  
  const { 
    moments, 
    loading, 
    error, 
    hasNext,
    initialized,
    fetchUserMoments, 
    loadMoreMoments, 
    refreshMoments,
    resetState
  } = useUserMomentStore()
  
  const { currentUser } = useUserStore()

  // 初始化加载
  useEffect(() => {
    let cancelled = false
    console.log('moment useEffect', userId)
    if (userId) {
      // 使用传递的用户信息
      if (userInfoFromState) {
        setTargetUser(userInfoFromState)
      }
      
      // 获取用户动态
      if (!cancelled) {
        fetchUserMoments(userId)
      }
    }
    
    // 组件卸载时重置状态
    return () => {
      cancelled = true
      resetState()
    }
  }, [userId, userInfoFromState, fetchUserMoments, resetState])


  // 刷新动态
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshMoments()
    } finally {
      setIsRefreshing(false)
    }
  }

  // 返回朋友圈页面
  const handleBack = () => {
    navigate('/main/moments')
  }

  // 处理发布成功
  const handlePublishSuccess = () => {
    setShowPublishDialog(false)
    // 如果是当前用户的动态页面，刷新列表
    if (userId && currentUser?.id === userId) {
      refreshMoments()
    }
  }

  // 如果没有userId，返回错误页面
  if (!userId) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorMessage}>用户ID不能为空</div>
        <Button onClick={handleBack} variant="outline">
          返回好友动态
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.userMomentsPage}>
      {/* 封面背景区域 */}
      <div className={styles.coverSection}>
        <div className={styles.coverBackground}>
          {/* 左上角返回按钮 */}
          <div className={styles.backButton}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className={styles.iconButton}
              title="返回好友动态"
            >
              <Undo2 size={20} />
            </Button>
          </div>
          
          {/* 右上角刷新按钮 */}
          <div className={styles.topActions}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`${styles.iconButton} ${isRefreshing || loading ? styles.rotating : ''}`}
              title="刷新"
            >
              <RefreshCw size={20} />
            </Button>
          </div>
          
          {/* 用户信息 - 右下角 */}
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                <EmojiText text={targetUser?.nickName || '未知用户'} size="1em" />
              </span>
            </div>
            <Avatar
              size={64}
              userId={userId}
              avatarUrl={targetUser?.avatar}
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
        targetUserId={userId}
      />

      {/* 发布动态对话框 */}
      <MomentPublishDialog
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onSuccess={handlePublishSuccess}
      />
    </div>
  )
} 