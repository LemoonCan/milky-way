import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Search, UserPlus, ChevronDown, ChevronRight, UserCheck } from 'lucide-react'
import { FriendListItem } from './FriendListItem'
import { FriendApplicationItem } from './FriendApplicationItem'
import { TitleBar } from '../TitleBar'
import { useFriendStore } from '../../store/friend'
import type { Friend } from '../../services/friend'
import type { FriendApplication } from '../../services/friend'
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
  const applicationsContainerRef = useRef<HTMLDivElement>(null)
  const friendsContainerRef = useRef<HTMLDivElement>(null)

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
      const displayName = friend.remark || friend.friend.nickName
      return (
        displayName.toLowerCase().includes(query) ||
        friend.friend.nickName.toLowerCase().includes(query)
      )
    })
  }, [friends, searchQuery])

  // 显示所有好友申请，不只是待处理的
  const displayApplications = useMemo(() => {
    console.log(`[FriendList] 好友申请列表更新，长度: ${friendApplications?.length || 0}`)
    console.log(`[FriendList] 申请列表内容:`, friendApplications?.map(app => ({ id: app.id, nickName: app.fromUser.nickName, status: app.status })) || [])
    return friendApplications || []
  }, [friendApplications])

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

  // 好友申请列表滚动检测
  const handleApplicationsScroll = useCallback(() => {
    const container = applicationsContainerRef.current
    if (!container || searchQuery.trim()) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = container
    // 当滚动到距离底部50px时，触发加载更多
    if (scrollHeight - scrollTop - clientHeight < 50) {
      if (hasNextApplicationsPage && !isApplicationsLoading) {
        console.log('[FriendList] 加载更多好友申请数据')
        fetchMoreFriendApplications()
      }
    }
  }, [
    searchQuery, 
    hasNextApplicationsPage,
    isApplicationsLoading,
    fetchMoreFriendApplications,
    lastApplicationId
  ])

  // 好友列表滚动检测
  const handleFriendsScroll = useCallback(() => {
    const container = friendsContainerRef.current
    if (!container || searchQuery.trim()) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = container
    // 当滚动到距离底部50px时，触发加载更多
    if (scrollHeight - scrollTop - clientHeight < 50) {
      if (hasNextPage && !isFriendsLoading) {
        console.log('[FriendList] 加载更多好友数据')
        fetchMoreFriends()
      }
    }
  }, [
    searchQuery, 
    hasNextPage,
    isFriendsLoading,
    fetchMoreFriends,
    lastLetter, 
    lastNickName
  ])

  // 绑定好友申请列表滚动事件
  useEffect(() => {
    const container = applicationsContainerRef.current
    if (container && newFriendsExpanded) {
      container.addEventListener('scroll', handleApplicationsScroll)
      return () => container.removeEventListener('scroll', handleApplicationsScroll)
    }
  }, [handleApplicationsScroll, newFriendsExpanded])

  // 绑定好友列表滚动事件
  useEffect(() => {
    const container = friendsContainerRef.current
    if (container && friendsExpanded) {
      container.addEventListener('scroll', handleFriendsScroll)
      return () => container.removeEventListener('scroll', handleFriendsScroll)
    }
  }, [handleFriendsScroll, friendsExpanded])

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
                <div className={styles.applicationsContainer} ref={applicationsContainerRef}>
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
                <div className={styles.friendsContainer} ref={friendsContainerRef}>
                  {filteredFriends.map((friend) => (
                    <FriendListItem
                      key={friend.friend.id}
                      friend={friend}
                      isActive={selectedFriend?.friend.id === friend.friend.id}
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