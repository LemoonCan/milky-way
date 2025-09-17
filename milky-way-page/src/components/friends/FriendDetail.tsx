import React, { useState, useRef, useEffect } from 'react'
import { Avatar } from '../Avatar'
import { EmojiText } from '../EmojiText'
import { MoreHorizontal, UserMinus, UserX, UserCheck, FileText, ChevronRight, ChevronLeft } from 'lucide-react'
import { ConfirmDialog } from '../ui/confirm-dialog'
import { CommunicationActions } from '../CommunicationActions'
import { useFriendStore } from '../../store/friend'
import { userService } from '../../services/user'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { Friend } from '../../services/friend'
import type { UserDetailInfo } from '../../services/user'
import styles from '../../css/friends/FriendDetail.module.css'
import { useMomentStore, MomentType } from '../../store/moment'

interface FriendDetailProps {
  friend: Friend
  onBack?: () => void
}

export const FriendDetail: React.FC<FriendDetailProps> = ({ friend, onBack }) => {
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showUnblockDialog, setShowUnblockDialog] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetailInfo | null>(null)
  const moreActionsRef = useRef<HTMLDivElement>(null)
  const lastFetchedUserIdRef = useRef<string | null>(null)
  const navigate = useNavigate()
  const { deleteFriend, blockFriend, unblockFriend, isLoading } = useFriendStore()
  const { navigateToMomentPage } = useMomentStore()
  const isMobile = useIsMobile()

  // 获取用户详细信息
  useEffect(() => {
    // 如果已经请求过相同的用户ID，则跳过请求
    if (lastFetchedUserIdRef.current === friend.friend.id) {
      setLoading(false)
      return
    }

    const fetchUserDetails = async () => {
      try {
        setLoading(true)
        // 记录当前请求的用户ID
        lastFetchedUserIdRef.current = friend.friend.id
        const response = await userService.getUserDetail(friend.friend.id)
        if (response.success && response.data) {
          // 保存用户详细信息到state中
          setUserDetails(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch user detail:', error)
        // 如果请求失败，清除记录以允许重试
        lastFetchedUserIdRef.current = null
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [friend])

  // 点击外部关闭更多操作菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setShowMoreActions(false)
      }
    }

    if (showMoreActions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMoreActions])


  const handleDeleteFriend = () => {
    setShowDeleteDialog(true)
  }

  const handleBlockFriend = () => {
    setShowBlockDialog(true)
  }

  const handleUnblockFriend = () => {
    setShowUnblockDialog(true)
  }

  const confirmDeleteFriend = async () => {
    await deleteFriend(friend.friend.id)
    setShowDeleteDialog(false)
    setShowMoreActions(false)
  }

  const confirmBlockFriend = async () => {
    await blockFriend(friend.friend.id)
    setShowBlockDialog(false)
    setShowMoreActions(false)
  }

  const confirmUnblockFriend = async () => {
    await unblockFriend(friend.friend.id)
    setShowUnblockDialog(false)
    setShowMoreActions(false)
  }


  // 格式化动态内容
  const formatMomentContent = (moment: UserDetailInfo['lastMoment']) => {
    if (!moment) return null
    
    const hasText = moment.text && moment.text !== null && moment.text.trim().length > 0
    const hasMedia = moment.medias && moment.medias.length > 0

    if (hasText) {
      return <EmojiText text={moment.text!} size="1em" />
    } else if (hasMedia) {
      return (
        <div className={styles.momentImages}>
          {moment.medias!.slice(0, 3).map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl}
              alt={`动态图片 ${index + 1}`}
              className={styles.momentImage}
            />
          ))}
          {moment.medias!.length > 3 && (
            <div className={styles.moreImages}>
              +{moment.medias!.length - 3}
            </div>
          )}
        </div>
      )
    }
    
    return null
  }

  return (
    <div className={styles.friendDetail}>
        {/* 移动端返回按钮 */}
        {isMobile && onBack && (
          <div className={styles.mobileHeader}>
            <button className={styles.backButton} onClick={onBack}>
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      
      {/* 顶部基本信息 */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          <Avatar
            avatarUrl={friend.friend.avatar}
            userId={friend.friend.id}
            size={100}
          />
          {friend.status === 'BLACKLISTED' && (
            <div className={styles.blockedIndicator}>已拉黑</div>
          )}
        </div>
        
        <div className={styles.basicInfo}>
          <h1 className={styles.displayName}>
            <EmojiText text={friend.remark || friend.friend.nickName} size="1em" />
          </h1>
          {friend.remark && (
            <div className={styles.nickName}>昵称：<EmojiText text={friend.friend.nickName} size="1em" /></div>
          )}
          <div className={styles.wechatId}>账号：{friend.friend.openId}</div>
          <div className={styles.region}>地区：暂未设置</div>
        </div>
      </div>

      {/* 个性签名区域 */}
      <div className={styles.signatureSection}>
        <div className={styles.sectionTitle}>个性签名</div>
        <div className={styles.signatureContent}>
          <EmojiText text={userDetails?.individualSignature || '暂无个性签名'} size="1em" />
        </div>
      </div>

      {/* 最新动态按钮 */}
      <button
        className={styles.latestMomentButton}
        onClick={() => navigateToMomentPage(MomentType.USER, navigate, userDetails)}
      >
        <div className={styles.momentLabel}>最新动态</div>
        <div className={styles.momentContent}>
          {userDetails?.lastMoment ? formatMomentContent(userDetails.lastMoment) : (
            <div className={styles.noMoment}>
              <FileText size={16} />
              <span>暂无动态</span>
            </div>
          )}
        </div>
        <ChevronRight size={16} className={styles.chevronIcon} />
      </button>

      {/* 主要操作按钮 */}
      <CommunicationActions
        userId={friend.friend.id}
        userName={friend.remark || friend.friend.nickName}
        disabled={friend.status === 'BLACKLISTED'}
        className={styles.primaryActions}
      />

      {/* 更多操作按钮 */}
       <div className={styles.moreActionsContainer} ref={moreActionsRef}>
        <button
          onClick={() => setShowMoreActions(!showMoreActions)}
          className={styles.moreActionsButton}
        >
          <MoreHorizontal size={20} />
          更多操作
        </button>
        
        {showMoreActions && (
          <div className={styles.moreActionsMenu}>
            {friend.status === 'BLACKLISTED' ? (
              <button
                onClick={handleUnblockFriend}
                className={styles.moreActionItem}
                disabled={isLoading}
              >
                <UserCheck size={16} />
                解除拉黑
              </button>
            ) : (
              <button
                onClick={handleBlockFriend}
                className={styles.moreActionItem}
                disabled={isLoading}
              >
                <UserX size={16} />
                拉黑好友
              </button>
            )}
            
            <button
              onClick={handleDeleteFriend}
              className={`${styles.moreActionItem} ${styles.dangerAction}`}
              disabled={isLoading}
            >
              <UserMinus size={16} />
              删除好友
            </button>
          </div>
        )}
      </div>

      {/* 删除好友确认弹框 */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="删除好友"
        message={`确定要删除好友 ${friend.remark || friend.friend.nickName} 吗？删除后将无法再与该用户聊天。`}
        confirmText="删除好友"
        cancelText="取消"
        onConfirm={confirmDeleteFriend}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* 拉黑好友确认弹框 */}
      <ConfirmDialog
        isOpen={showBlockDialog}
        title="拉黑好友"
        message={`确定要拉黑 ${friend.remark || friend.friend.nickName} 吗？拉黑后对方将无法向您发送消息。`}
        confirmText="拉黑好友"
        cancelText="取消"
        onConfirm={confirmBlockFriend}
        onCancel={() => setShowBlockDialog(false)}
      />

      {/* 解除拉黑确认弹框 */}
      <ConfirmDialog
        isOpen={showUnblockDialog}
        title="解除拉黑"
        message={`确定要解除拉黑 ${friend.remark || friend.friend.nickName} 吗？`}
        confirmText="解除拉黑"
        cancelText="取消"
        onConfirm={confirmUnblockFriend}
        onCancel={() => setShowUnblockDialog(false)}
      />
    </div>
  )
} 