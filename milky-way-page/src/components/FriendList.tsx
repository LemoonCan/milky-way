import React, { useState, useMemo } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { FriendListItem } from './FriendListItem'
import { useFriendStore } from '../store/friend'
import type { Friend } from '../types/api'
import styles from '../css/FriendList.module.css'

interface FriendListProps {
  onAddFriend: () => void
}

export const FriendList: React.FC<FriendListProps> = ({ onAddFriend }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const { friends, selectedFriend, setSelectedFriend, isLoading } = useFriendStore()

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

  const handleSelectFriend = (friend: Friend) => {
    setSelectedFriend(friend)
  }

  return (
    <div className={styles.friendList}>
      {/* 头部区域 */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>好友</h1>
          <button
            onClick={onAddFriend}
            className={styles.addButton}
            title="添加好友"
          >
            <UserPlus size={20} />
          </button>
        </div>
        
        {/* 搜索框 */}
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="搜索好友"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* 好友列表 */}
      <div className={styles.listContainer}>
        {isLoading && (!friends || friends.length === 0) ? (
          <div className={styles.loadingState}>
            加载中...
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? '未找到匹配的好友' : '暂无好友'}
          </div>
        ) : (
          <div className={styles.friendsContainer}>
            {filteredFriends.map((friend: Friend) => (
              <FriendListItem
                key={friend.openId}
                friend={friend}
                isActive={selectedFriend?.openId === friend.openId}
                onClick={() => handleSelectFriend(friend)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 