import React, { useState, useEffect } from 'react'
import { FriendList } from './FriendList'
import { FriendDetail } from './FriendDetail'
import { FriendApplicationDetail } from './FriendApplicationDetail'
import { AddFriendDialog } from './AddFriendDialog'
import { useFriendStore } from '../../store/friend'
import { useUserStore } from '../../store/user'
import { useIsMobile } from '../../hooks/useIsMobile'
import styles from '../../css/friends/FriendPage.module.css'

export const FriendPage: React.FC = () => {
  const [showAddFriendDialog, setShowAddFriendDialog] = useState(false)
  const { selectedFriend, selectedFriendApplication, setSelectedFriend, setSelectedFriendApplication, fetchFriends, fetchFriendApplications } = useFriendStore()
  const { currentUser } = useUserStore()
  const isMobile = useIsMobile()
  const [showDetail, setShowDetail] = useState(false)

  // 初始化时获取好友列表和申请列表
  useEffect(() => {
    if(currentUser){
      fetchFriends(true)
      fetchFriendApplications()
    }
  }, [currentUser, fetchFriends, fetchFriendApplications])
  
  // 移动端：当选中好友或申请时显示详情页
  useEffect(() => {
    if (isMobile && (selectedFriend || selectedFriendApplication)) {
      setShowDetail(true)
    } else if (isMobile && !selectedFriend && !selectedFriendApplication) {
      setShowDetail(false)
    }
  }, [isMobile, selectedFriend, selectedFriendApplication])

  // 处理添加好友
  const handleAddFriend = () => {
    setShowAddFriendDialog(true)
  }

  const handleCloseAddFriendDialog = () => {
    setShowAddFriendDialog(false)
  }
  
  // 移动端返回好友列表
  const handleBackToList = () => {
    setSelectedFriend(null)
    setSelectedFriendApplication(null)
    setShowDetail(false)
  }
  

  // 桌面端布局（保持原有逻辑）
  if (!isMobile) {
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
      </div>
    )
  }
  
  // 移动端布局
  return (
    <div className={styles.friendPage}>
      {!showDetail ? (
        // 显示好友列表
        <FriendList onAddFriend={handleAddFriend} />
      ) : (
        // 显示详情页
        <div className={styles.mobileDetail}>
          {selectedFriend ? (
            <FriendDetail friend={selectedFriend} onBack={handleBackToList} />
          ) : selectedFriendApplication ? (
            <FriendApplicationDetail application={selectedFriendApplication} onBack={handleBackToList} />
          ) : null}
        </div>
      )}

      {/* 添加好友对话框 */}
      <AddFriendDialog
        open={showAddFriendDialog}
        onClose={handleCloseAddFriendDialog}
      />
    </div>
  )
} 