import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Search, UserPlus, ChevronDown, ChevronRight, UserCheck } from 'lucide-react'
import { FriendListItem } from './FriendListItem'
import { FriendApplicationItem } from './FriendApplicationItem'
import { useFriendStore } from '../store/friend'
import type { Friend, FriendApplication } from '../types/api'
import styles from '../css/FriendList.module.css'

interface FriendListProps {
  onAddFriend: () => void
}

export const FriendList: React.FC<FriendListProps> = ({ onAddFriend }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [newFriendsExpanded, setNewFriendsExpanded] = useState(true) // 默认展开
  const [friendsExpanded, setFriendsExpanded] = useState(true)
  
  const { 
    friends, 
    friendApplications,
    selectedFriend, 
    selectedFriendApplication,
    setSelectedFriend, 
    setSelectedFriendApplication,
    isFriendsLoading, 
    isApplicationsLoading,
    hasNextPage, 
    hasNextApplicationsPage,
    fetchMoreFriends,
    fetchMoreFriendApplications,
    lastLetter,
    lastNickName,
    lastApplicationId,
    totalFriendsCount,
    fetchFriendsCount
  } = useFriendStore()
  
  const listContainerRef = useRef<HTMLDivElement>(null)

  // 组件加载时获取好友总数（只在组件挂载时执行一次）
  useEffect(() => {
    fetchFriendsCount()
  }, []) // 移除依赖项，只在组件挂载时执行一次

  // 本地搜索过滤好友
  const filteredFriends = useMemo(() => {
    const friendsList = friends || []
    if (!searchQuery.trim()) return friendsList
    
    const query = searchQuery.toLowerCase()
    return friendsList.filter((friend: Friend) => {
      const displayName = friend.remark || friend.nickName
      return (
        displayName.toLowerCase().includes(query) ||
        friend.nickName.toLowerCase().includes(query)
      )
    })
  }, [friends, searchQuery])

  // 显示所有好友申请，不只是待处理的
  const displayApplications = useMemo(() => {
    return friendApplications || []
  }, [friendApplications])

  // 统计待处理的申请数量
  const pendingCount = useMemo(() => {
    return friendApplications.filter(app => app.status === 'APPLYING').length
  }, [friendApplications])

  // 处理滚动事件，实现无限滚动加载
  const handleScroll = useCallback(() => {
    const container = listContainerRef.current
    if (!container || searchQuery.trim() || isFriendsLoading) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = container
    // 当滚动到距离底部50px时，触发加载更多
    if (scrollHeight - scrollTop - clientHeight < 50) {
      // 根据当前展开的区域决定加载哪种数据
      if (newFriendsExpanded && hasNextApplicationsPage) {
        console.log('触发加载更多申请，当前游标:', { lastApplicationId })
        fetchMoreFriendApplications()
      } else if (friendsExpanded && hasNextPage) {
        console.log('触发加载更多好友，当前游标:', { lastLetter, lastNickName })
        fetchMoreFriends()
      }
    }
  }, [
    searchQuery, 
    hasNextPage, 
    hasNextApplicationsPage,
    isFriendsLoading, 
    fetchMoreFriends, 
    fetchMoreFriendApplications,
    lastLetter, 
    lastNickName, 
    lastApplicationId,
    newFriendsExpanded, 
    friendsExpanded
  ])

  // 绑定滚动事件
  useEffect(() => {
    const container = listContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend)
    setSelectedFriendApplication(null) // 清除申请选中状态
  }

  const handleSelectApplication = (application: FriendApplication) => {
    setSelectedFriendApplication(application)
    setSelectedFriend(null) // 清除好友选中状态
  }

  const toggleNewFriends = () => {
    setNewFriendsExpanded(!newFriendsExpanded)
  }

  const toggleFriends = () => {
    setFriendsExpanded(!friendsExpanded)
  }

  return (
    <div className={styles.friendList}>
      {/* 搜索栏 */}
      <div className={styles.searchContainer}>
        <div className={styles.searchInputWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="搜索好友"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button 
          className={styles.addFriendButton}
          onClick={onAddFriend}
          title="添加好友"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className={styles.listContainer} ref={listContainerRef}>
        {/* 新朋友区域 */}
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader} onClick={toggleNewFriends}>
            <div className={styles.sectionIcon}>
              {newFriendsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            <div className={styles.sectionAvatar}>
              <UserPlus size={20} />
            </div>
            <div className={styles.sectionInfo}>
              <div className={styles.sectionTitle}>新朋友</div>
              {pendingCount > 0 && (
                <div className={styles.sectionBadge}>{pendingCount}</div>
              )}
            </div>
          </div>
          
          {newFriendsExpanded && (
            <div className={styles.sectionContent}>
              {isApplicationsLoading && (!friendApplications || friendApplications.length === 0) ? (
                <div className={styles.loadingState}>
                  加载中...
                </div>
              ) : displayApplications.length === 0 ? (
                <div className={styles.emptyState}>
                  暂无好友申请
                </div>
              ) : (
                <div className={styles.applicationsContainer}>
                  {displayApplications.map((application) => (
                    <FriendApplicationItem
                      key={application.id}
                      application={application}
                      isSelected={selectedFriendApplication?.id === application.id}
                      onSelect={handleSelectApplication}
                    />
                  ))}
                  
                  {/* 加载更多申请指示器 */}
                  {hasNextApplicationsPage && (
                    <div className={styles.loadMoreContainer}>
                      {isApplicationsLoading ? (
                        <div className={styles.loadingMore}>
                          <div className={styles.loadingSpinner}></div>
                          <span>加载更多...</span>
                        </div>
                      ) : (
                        <button 
                          className={styles.loadMoreButton}
                          onClick={() => {
                            fetchMoreFriendApplications()
                          }}
                        >
                          加载更多...
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 朋友们区域 */}
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader} onClick={toggleFriends}>
            <div className={styles.sectionIcon}>
              {friendsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            <div className={styles.sectionAvatar}>
              <UserCheck size={20} />
            </div>
            <div className={styles.sectionInfo}>
              <div className={styles.sectionTitle}>朋友们</div>
              <div className={styles.sectionCount}>
                {searchQuery ? filteredFriends.length : totalFriendsCount}
              </div>
            </div>
          </div>
          
          {friendsExpanded && (
            <div className={styles.sectionContent}>
              {isFriendsLoading && (!friends || friends.length === 0) ? (
                <div className={styles.loadingState}>
                  加载中...
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className={styles.emptyState}>
                  {searchQuery ? '未找到匹配的好友' : '暂无好友'}
                </div>
              ) : (
                <div className={styles.friendsContainer}>
                  {filteredFriends.map((friend) => (
                    <FriendListItem
                      key={friend.openId}
                      friend={friend}
                      isActive={selectedFriend?.openId === friend.openId}
                      onClick={() => handleSelectFriend(friend)}
                    />
                  ))}
                  
                  {/* 加载更多好友指示器 */}
                  {!searchQuery && hasNextPage && (
                    <div className={styles.loadMoreContainer}>
                      {isFriendsLoading ? (
                        <div className={styles.loadingMore}>
                          <div className={styles.loadingSpinner}></div>
                          <span>加载更多...</span>
                        </div>
                      ) : (
                        <button 
                          className={styles.loadMoreButton}
                          onClick={() => {
                            fetchMoreFriends()
                          }}
                        >
                          加载更多...
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 开发调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ padding: '10px', fontSize: '12px', color: '#999' }}>
            好友: {friends.length} ({hasNextPage ? `有更多 (${lastLetter}/${lastNickName})` : '已全部加载'}) | 
            申请: {friendApplications.length} ({hasNextApplicationsPage ? `有更多 (${lastApplicationId})` : '已全部加载'})
          </div>
        )}
      </div>
    </div>
  )
} 