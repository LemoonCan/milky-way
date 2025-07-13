import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RefreshCw, Undo2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Avatar } from '../Avatar'
import { MomentItem } from './MomentItem'
import { momentService } from '../../services/moment'
import type { MomentDTO } from '../../types/api'
import styles from '../../css/moments/MomentDetailPage.module.css'

export const MomentDetailPage: React.FC = () => {
  const { momentId } = useParams<{ momentId: string }>()
  const navigate = useNavigate()
  const [moment, setMoment] = useState<MomentDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 加载动态详情
  const loadMoment = async () => {
    if (!momentId) return
    
    try {
      setLoading(true)
      setError(null)
      const momentData = await momentService.getMoment(momentId)
      setMoment(momentData)
    } catch (err) {
      console.error('Failed to load moment:', err)
      // 尝试从错误对象中获取具体的错误消息
      const errorMessage = err instanceof Error ? err.message : '加载动态失败'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 初始化加载
  useEffect(() => {
    loadMoment()
  }, [momentId])

  // 刷新动态
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadMoment()
    } finally {
      setIsRefreshing(false)
    }
  }

  // 返回朋友圈页面
  const handleBack = () => {
    navigate('/main/moments')
  }

  // 如果没有momentId，返回错误页面
  if (!momentId) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.errorMessage}>动态ID不能为空</div>
        <Button onClick={handleBack} variant="outline">
          返回朋友圈
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.momentDetailPage}>
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
              title="返回朋友圈"
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
                {moment?.user?.nickName || '未知用户'}
              </span>
            </div>
            <Avatar
              size={64}
              userId={moment?.user?.id || ''}
              avatarUrl={moment?.user?.avatar}
              className={styles.userAvatar}
            />
          </div>
        </div>
      </div>

      {/* 动态详情内容 */}
      <div className={styles.momentContent}>
        <div className={styles.momentContentInner}>
          {/* 错误提示 */}
          {error && (
            <div className={styles.errorToast}>
              <span>{error}</span>
              <button 
                className={styles.errorCloseBtn}
                onClick={() => setError(null)}
              >
                ×
              </button>
            </div>
          )}

          {/* 动态详情 */}
          {!loading && moment && (
            <MomentItem moment={moment} expandComments={true} />
          )}

          {/* 空状态 */}
          {!loading && !moment && !error && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📱</div>
              <h3>动态不存在</h3>
              <p>该动态可能已被删除或不存在</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 