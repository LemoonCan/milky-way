import React, { useState, useRef, useEffect } from 'react'
import { Avatar } from './Avatar'
import { EmojiText } from './EmojiText'
import { MessageCircle, Phone, Video, MoreHorizontal, UserMinus, UserX, UserCheck } from 'lucide-react'
import { ConfirmDialog } from './ui/confirm-dialog'
import { useFriendStore } from '../store/friend'
import { userService } from '../services/user'
import type { Friend, User } from '../types/api'
import styles from '../css/FriendDetail.module.css'

interface FriendDetailProps {
  friend: Friend
}

export const FriendDetail: React.FC<FriendDetailProps> = ({ friend }) => {
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showUnblockDialog, setShowUnblockDialog] = useState(false)
  const [userDetails, setUserDetails] = useState<User | null>(null)
  const moreActionsRef = useRef<HTMLDivElement>(null)
  const lastFetchedOpenIdRef = useRef<string | null>(null)
  const { deleteFriend, blockFriend, unblockFriend, isLoading } = useFriendStore()

  // 获取用户详细信息
  useEffect(() => {
    // 如果已经请求过相同的openId，则跳过请求
    if (lastFetchedOpenIdRef.current === friend.openId) {
      setLoading(false)
      return
    }

    const fetchUserDetails = async () => {
      try {
        console.log(friend);
        setLoading(true)
        // 记录当前请求的openId
        lastFetchedOpenIdRef.current = friend.openId
        const response = await userService.getUserByOpenId(friend.openId)
        if (response.success && response.data) {
          // 保存用户详细信息到state中
          setUserDetails(response.data)
          console.log('User details fetched:', response.data)
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error)
        // 如果请求失败，清除记录以允许重试
        lastFetchedOpenIdRef.current = null
      } finally {
        setLoading(false)
      }
    }

    fetchUserDetails()
  }, [friend.openId])

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

  const handleSendMessage = () => {
    // 这里可以跳转到聊天界面
    console.log('Send message to:', friend.nickName)
  }

  const handleVoiceCall = () => {
    console.log('Voice call to:', friend.nickName)
  }

  const handleVideoCall = () => {
    console.log('Video call to:', friend.nickName)
  }

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
    await deleteFriend(friend.id)
    setShowDeleteDialog(false)
    setShowMoreActions(false)
  }

  const confirmBlockFriend = async () => {
    await blockFriend(friend.id)
    setShowBlockDialog(false)
    setShowMoreActions(false)
  }

  const confirmUnblockFriend = async () => {
    await unblockFriend(friend.id)
    setShowUnblockDialog(false)
    setShowMoreActions(false)
  }

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className={styles.friendDetail}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }  

  return (
    <div className={styles.friendDetail}>
      {/* 顶部基本信息 */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarContainer}>
          <Avatar
            avatarUrl={friend.avatar}
            userId={friend.id}
            size={100}
          />
          {friend.status === 'BLACKLISTED' && (
            <div className={styles.blockedIndicator}>已拉黑</div>
          )}
        </div>
        
        <div className={styles.basicInfo}>
          <h1 className={styles.displayName}>
            <EmojiText text={friend.remark || friend.nickName} size="1em" />
          </h1>
          {friend.remark && (
            <div className={styles.nickName}>昵称：<EmojiText text={friend.nickName} size="1em" /></div>
          )}
          <div className={styles.wechatId}>账号：{friend.openId}</div>
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

      {/* 主要操作按钮 */}
      <div className={styles.primaryActions}>
        <button
          onClick={handleSendMessage}
          className={styles.actionButton}
          disabled={friend.status === 'BLACKLISTED'}
        >
          <MessageCircle size={24} />
          <span>发消息</span>
        </button>
        
        <button
          onClick={handleVoiceCall}
          className={styles.actionButton}
          disabled={friend.status === 'BLACKLISTED'}
        >
          <Phone size={24} />
          <span>语音通话</span>
        </button>
        
        <button
          onClick={handleVideoCall}
          className={styles.actionButton}
          disabled={friend.status === 'BLACKLISTED'}
        >
          <Video size={24} />
          <span>视频通话</span>
        </button>
      </div>

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
        message={`确定要删除好友 ${friend.remark || friend.nickName} 吗？删除后将无法再与该用户聊天。`}
        confirmText="删除好友"
        cancelText="取消"
        onConfirm={confirmDeleteFriend}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* 拉黑好友确认弹框 */}
      <ConfirmDialog
        isOpen={showBlockDialog}
        title="拉黑好友"
        message={`确定要拉黑 ${friend.remark || friend.nickName} 吗？拉黑后对方将无法向您发送消息。`}
        confirmText="拉黑好友"
        cancelText="取消"
        onConfirm={confirmBlockFriend}
        onCancel={() => setShowBlockDialog(false)}
      />

      {/* 解除拉黑确认弹框 */}
      <ConfirmDialog
        isOpen={showUnblockDialog}
        title="解除拉黑"
        message={`确定要解除拉黑 ${friend.remark || friend.nickName} 吗？`}
        confirmText="解除拉黑"
        cancelText="取消"
        onConfirm={confirmUnblockFriend}
        onCancel={() => setShowUnblockDialog(false)}
      />
    </div>
  )
} 