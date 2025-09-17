import { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Edit3 } from 'lucide-react'
import { Button } from '../ui/button'
import { MomentItem } from './MomentItem'
import { useUserStore } from '../../store/user'
import type { MomentDTO } from '../../services/moment'
import styles from '../../css/moments/MomentsList.module.css'

interface MomentsListProps {
  moments: MomentDTO[]
  loading: boolean
  hasNext: boolean
  onLoadMore: () => void
  onPublish: () => void
  targetUserId?: string // 目标用户ID，用于判断是否为当前用户
}

export interface MomentsListRef {
  scrollToTop: () => void
}

export const MomentsList = forwardRef<MomentsListRef, MomentsListProps>(({
  moments,
  loading,
  hasNext,
  onLoadMore,
  onPublish,
  targetUserId
}, ref) => {
  const momentsListRef = useRef<HTMLDivElement>(null)
  const { currentUser } = useUserStore()
  
  // 判断是否为当前用户
  const isCurrentUser = targetUserId ? currentUser?.id === targetUserId : true
  
  // 根据是否为当前用户决定空状态文案
  const emptyTitle = isCurrentUser ? "还没有动态" : "还没有动态"
  const emptyDescription = isCurrentUser ? "发布第一条动态，分享你的生活吧！" : "该用户暂时没有发布动态"
  const showPublishButton = isCurrentUser

  // 滚动到顶部的方法
  const scrollToTop = useCallback(() => {
    const scrollContainer = momentsListRef.current
    if (scrollContainer) {
      scrollContainer.scrollTop = 0
    }
  }, [])

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    scrollToTop
  }), [scrollToTop])

  // 无限滚动处理
  const handleScroll = useCallback(() => {
    const scrollContainer = momentsListRef.current
    if (!scrollContainer || loading || !hasNext) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer
    // 当滚动到底部附近时（距离底部100px）触发加载
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      onLoadMore()
    }
  }, [loading, hasNext, onLoadMore])

  // 监听滚动事件
  useEffect(() => {
    const scrollContainer = momentsListRef.current
    if (!scrollContainer) return

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [handleScroll])


  return (
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

        {/* 空状态 - 只有在非加载状态且动态确实为空时才显示 */}
        {!loading && moments.length === 0 && (
          <div className={styles.empty}>
            <Edit3 size={48} className={styles.emptyIcon} />
            <h3>{emptyTitle}</h3>
            <p>{emptyDescription}</p>
            {showPublishButton && (
              <Button 
                onClick={onPublish}
                className={styles.publishButton}
              >
                <Edit3 size={16} />
                发布动态
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
})
