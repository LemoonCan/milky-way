import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { RefreshCw, Undo2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar } from '../Avatar'
import { MomentItem } from './MomentItem'
import { useUserMomentStore } from '../../store/userMoment'
import type { UserDetailInfo } from '../../services/user'
import styles from '../../css/moments/UserMomentsPage.module.css'

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
  const momentsListRef = useRef<HTMLDivElement>(null)
  
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
  }, []) // 空依赖数组，只在组件挂载时执行

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

  // 返回朋友圈页面
  const handleBack = () => {
    navigate('/main/moments')
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
                {targetUser?.nickName || '未知用户'}
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
      <div className={styles.momentsList} ref={momentsListRef}>
        <div className={styles.momentsListInner}>
          {/* 错误提示现在由全局处理 */}

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
              <div className={styles.emptyIcon}>📱</div>
              <h3>还没有动态</h3>
              <p>该用户暂时没有发布动态</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 