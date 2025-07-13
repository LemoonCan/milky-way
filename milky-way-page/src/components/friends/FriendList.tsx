import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Search, UserPlus, ChevronDown, ChevronRight, UserCheck } from 'lucide-react'
import { FriendListItem } from './FriendListItem'
import { FriendApplicationItem } from './FriendApplicationItem'
import { TitleBar } from '../TitleBar'
import { useFriendStore } from '../../store/friend'
import type { Friend, FriendApplication } from '../../types/api'
import styles from '../../css/friends/FriendList.module.css'

interface FriendListProps {
  onAddFriend: () => void
}

export const FriendList: React.FC<FriendListProps> = ({ onAddFriend }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [newFriendsExpanded, setNewFriendsExpanded] = useState(false) // 默认收起
  const [friendsExpanded, setFriendsExpanded] = useState(true)
  // 新增：追踪用户是否手动收起了新朋友区域
  const [manuallyCollapsed, setManuallyCollapsed] = useState(false)
  
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
    fetchFriendsCount,
    // 新增：好友申请数量相关
    pendingApplicationsCount,
    fetchApplicationsCount
  } = useFriendStore()
  
  const listContainerRef = useRef<HTMLDivElement>(null)

  // 组件加载时获取好友总数和申请数量
  useEffect(() => {
    fetchFriendsCount()
    fetchApplicationsCount()
  }, [])
  
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
    console.log(`[FriendList] 好友申请列表更新，长度: ${friendApplications?.length || 0}`)
    console.log(`[FriendList] 申请列表内容:`, friendApplications?.map(app => ({ id: app.id, nickName: app.fromUser.nickName, status: app.status })) || [])
    return friendApplications || []
  }, [friendApplications])

  // 移除原来的客户端统计逻辑，直接使用接口获取的数量
  // const pendingCount = useMemo(() => {
  //   const count = friendApplications.filter(app => app.status === 'APPLYING').length
  //   console.log(`[FriendList] 待处理申请数量: ${count}`)
  //   return count
  // }, [friendApplications])

  // 当有待处理申请时自动展开新朋友区域，但尊重用户的手动操作
  useEffect(() => {
    if (pendingApplicationsCount > 0 && !newFriendsExpanded && !manuallyCollapsed) {
      setNewFriendsExpanded(true)
    }
    // 当没有待处理申请时，重置手动收起状态
    if (pendingApplicationsCount === 0) {
      setManuallyCollapsed(false)
    }
  }, [pendingApplicationsCount, newFriendsExpanded, manuallyCollapsed])

  // 处理滚动事件，实现无限滚动加载
  const handleScroll = useCallback(() => {
    const container = listContainerRef.current
    if (!container || searchQuery.trim()) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = container
    // 当滚动到距离底部50px时，触发加载更多
    if (scrollHeight - scrollTop - clientHeight < 50) {
      // 根据当前展开的区域决定加载哪种数据
      if (newFriendsExpanded && hasNextApplicationsPage && !isApplicationsLoading) {
        fetchMoreFriendApplications()
      } else if (friendsExpanded && hasNextPage && !isFriendsLoading) {
        fetchMoreFriends()
      }
    }
  }, [
    searchQuery, 
    hasNextPage, 
    hasNextApplicationsPage,
    isFriendsLoading, 
    isApplicationsLoading,
    fetchMoreFriends, 
    fetchMoreFriendApplications,
    lastLetter, 
    lastNickName, 
    lastApplicationId,
    newFriendsExpanded, 
    friendsExpanded,
    friends,
    friendApplications
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
    const newState = !newFriendsExpanded
    setNewFriendsExpanded(newState)
    // 如果用户手动收起（从展开变为收起），记录这个操作
    if (!newState && pendingApplicationsCount > 0) {
      setManuallyCollapsed(true)
    }
  }

  const toggleFriends = () => {
    setFriendsExpanded(!friendsExpanded)
  }

  return (
    <div className={styles.friendList}>
      {/* 头部区域 */}
      <TitleBar title="好友" />
      
      {/* 搜索栏 */}
      <div className={styles.searchSection}>
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
              {pendingApplicationsCount > 0 && (
                <div className={styles.sectionBadge}>{pendingApplicationsCount}</div>
              )}
            </div>
          </div>
          
          {newFriendsExpanded && (
            <div className={styles.sectionContent}>
              {displayApplications.length === 0 ? (
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
              {filteredFriends.length === 0 ? (
                <div className={styles.emptyState}>
                  {searchQuery ? '未找到匹配的好友' : '暂无好友'}
                </div>
              ) : (
                <div className={styles.friendsContainer}>
                  {filteredFriends.map((friend) => (
                    <FriendListItem
                      key={friend.id}
                      friend={friend}
                      isActive={selectedFriend?.id === friend.id}
                      onClick={() => handleSelectFriend(friend)}
                    />
                  ))}
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