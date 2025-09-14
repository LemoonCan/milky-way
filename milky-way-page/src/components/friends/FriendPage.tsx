import React, { useState, useEffect } from 'react'
import { FriendList } from './FriendList'
import { FriendDetail } from './FriendDetail'
import { FriendApplicationDetail } from './FriendApplicationDetail'
import { AddFriendDialog } from './AddFriendDialog'
import { useFriendStore } from '../../store/friend'
import { useUserStore } from '../../store/user'
import styles from '../../css/friends/FriendPage.module.css'

export const FriendPage: React.FC = () => {
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false)
  const { selectedFriend, selectedFriendApplication, fetchFriends, fetchFriendApplications } = useFriendStore()
  const {currentUser} = useUserStore()

  // 初始化时获取好友列表和申请列表
  useEffect(() => {
    if(currentUser){
      fetchFriends(true)
      fetchFriendApplications()
    }
  }, [currentUser, fetchFriends, fetchFriendApplications])

  // 处理添加好友
  const handleAddFriend = () => {
    setShowAddFriendDialog(true)
  }

  const handleCloseAddFriendDialog = () => {
    setShowAddFriendDialog(false)
  }


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

      {/* 错误提示现在由全局处理 */}
    </div>
  )
} 