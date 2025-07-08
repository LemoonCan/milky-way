import React, { useState, useEffect } from 'react'
import { FriendList } from './FriendList'
import { FriendDetail } from './FriendDetail'
import { FriendApplicationDetail } from './FriendApplicationDetail'
import { AddFriendDialog } from './AddFriendDialog'
import { useFriendStore } from '../../store/friend'
import styles from '../../css/friends/FriendPage.module.css'

export const FriendPage: React.FC = () => {
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false)
  const { selectedFriend, selectedFriendApplication, fetchFriends, fetchFriendApplications, error, clearError } = useFriendStore()

  // 初始化时获取好友列表和申请列表
  useEffect(() => {
    fetchFriends(true) // 明确传入true，表示刷新操作
    fetchFriendApplications()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 处理添加好友
  const handleAddFriend = () => {
    setShowAddFriendDialog(true)
  }

  const handleCloseAddFriendDialog = () => {
    setShowAddFriendDialog(false)
  }

  // 显示错误提示
  useEffect(() => {
    if (error) {
      // 这里可以添加全局提示组件
      console.error('Friend error:', error)
      // 3秒后自动清除错误
      const timer = setTimeout(() => {
        clearError()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  return (
    <div className={styles.friendPage}>
      {/* 左侧好友列表 */}
      <FriendList onAddFriend={handleAddFriend} />
      
      {/* 右侧详情 */}
      <div className={styles.friendDetail}>
        {selectedFriend ? (
          <FriendDetail friend={selectedFriend} />
        ) : selectedFriendApplication ? (
          <FriendApplicationDetail application={selectedFriendApplication} />
        ) : (
          <div className={styles.emptyState}>
            {/* 空状态，不显示任何内容 */}
          </div>
        )}
      </div>

      {/* 添加好友对话框 */}
      <AddFriendDialog
        open={showAddFriendDialog}
        onClose={handleCloseAddFriendDialog}
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