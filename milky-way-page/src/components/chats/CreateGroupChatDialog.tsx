import React, { useState, useEffect, useMemo } from 'react'
import { Search, X, Users, Check } from 'lucide-react'
import { Avatar } from '../Avatar'
import { useFriendStore } from '../../store/friend'
import { chatService, type CreateGroupChatRequest } from '../../services/chat'
import type { Friend } from '../../types/api'
import styles from '../../css/chats/CreateGroupChatDialog.module.css'

interface CreateGroupChatDialogProps {
  open: boolean
  onClose: () => void
  onSuccess?: (chatId: string) => void
}

export const CreateGroupChatDialog: React.FC<CreateGroupChatDialogProps> = ({ 
  open, 
  onClose, 
  onSuccess 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([])
  const [groupName, setGroupName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  
  const { friends, fetchFriends } = useFriendStore()

  // 组件打开时获取好友列表
  useEffect(() => {
    if (open && (!friends || friends.length === 0)) {
      fetchFriends(true)
    }
  }, [open, friends, fetchFriends])

  // 重置状态
  const handleClose = () => {
    setSearchQuery('')
    setSelectedFriends([])
    setGroupName('')
    setIsCreating(false)
    onClose()
  }

  // 过滤好友列表
  const filteredFriends = useMemo(() => {
    if (!friends) return []
    
    if (!searchQuery.trim()) return friends
    
    const query = searchQuery.toLowerCase()
    return friends.filter((friend: Friend) => {
      const displayName = friend.remark || friend.nickName
      return (
        displayName.toLowerCase().includes(query) ||
        friend.nickName.toLowerCase().includes(query)
      )
    })
  }, [friends, searchQuery])

  // 切换好友选择状态
  const toggleFriendSelection = (friend: Friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.find(f => f.id === friend.id)
      if (isSelected) {
        return prev.filter(f => f.id !== friend.id)
      } else {
        return [...prev, friend]
      }
    })
  }

  // 移除选中的好友
  const removeFriend = (friendId: string) => {
    setSelectedFriends(prev => prev.filter(f => f.id !== friendId))
  }

  // 创建群聊
  const handleCreateGroupChat = async () => {
    if (selectedFriends.length < 2) return

    // 如果没有输入群聊名称，聚焦到输入框
    if (!groupName.trim()) {
      const groupNameInput = document.querySelector(`.${styles.groupNameInput}`) as HTMLInputElement
      if (groupNameInput) {
        groupNameInput.focus()
        groupNameInput.style.borderColor = '#ef4444'
        setTimeout(() => {
          groupNameInput.style.borderColor = ''
        }, 2000)
      }
      return
    }

    setIsCreating(true)
    try {
      const request: CreateGroupChatRequest = {
        chatType: 'GROUP',
        title: groupName.trim(),
        members: selectedFriends.map(f => f.id)
      }
      
      const result = await chatService.createGroupChat(request)
      console.log('创建群聊成功:', result)
      
      // 创建成功后立即订阅该群聊的消息
      chatService.subscribeToGroupChat(result.id)
      console.log('已订阅群聊消息:', result.id)
      
      // 调用成功回调
      onSuccess?.(result.id)
      handleClose()
    } catch (error) {
      console.error('创建群聊失败:', error)
      // 这里可以添加错误提示
    } finally {
      setIsCreating(false)
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        {/* 头部 */}
        <div className={styles.header}>
          <h3 className={styles.title}>发起群聊</h3>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className={styles.content}>
          {/* 搜索框 */}
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="搜索好友"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* 已选择的好友 */}
          {selectedFriends.length > 0 && (
            <div className={styles.selectedSection}>
              <div className={styles.selectedLabel}>
                已选择 {selectedFriends.length} 人
              </div>
              <div className={styles.selectedFriends}>
                {selectedFriends.map((friend) => (
                  <div key={friend.id} className={styles.selectedFriend}>
                    <Avatar
                      avatarUrl={friend.avatar}
                      userId={friend.id}
                      size={40}
                    />
                    <div className={styles.selectedFriendName}>
                      {friend.remark || friend.nickName}
                    </div>
                    <button
                      onClick={() => removeFriend(friend.id)}
                      className={styles.removeFriendButton}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 好友列表 */}
          <div className={styles.friendsSection}>
            <div className={styles.friendsLabel}>选择群聊成员</div>
            <div className={styles.friendsList}>
              {filteredFriends.length === 0 ? (
                <div className={styles.emptyState}>
                  {searchQuery ? '未找到匹配的好友' : '暂无好友'}
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const isSelected = selectedFriends.find(f => f.id === friend.id)
                  return (
                    <div
                      key={friend.id}
                      className={`${styles.friendItem} ${isSelected ? styles.selected : ''}`}
                      onClick={() => toggleFriendSelection(friend)}
                    >
                                             <Avatar
                         avatarUrl={friend.avatar}
                         userId={friend.id}
                         size={40}
                       />
                       <div className={styles.friendInfo}>
                         <div className={styles.friendName}>
                           {friend.remark || friend.nickName}
                         </div>
                       </div>
                      <div className={styles.checkIcon}>
                        {isSelected && <Check size={18} />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 群聊名称 */}
          {selectedFriends.length >= 2 && (
            <div className={styles.groupNameSection}>
              <label className={styles.groupNameLabel}>群聊名称</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="请输入群聊名称"
                className={styles.groupNameInput}
                maxLength={50}
              />
              <div className={styles.groupNameCount}>
                {groupName.length}/50
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className={styles.footer}>
          <button
            onClick={handleClose}
            className={styles.cancelButton}
          >
            取消
          </button>
          <button
            onClick={handleCreateGroupChat}
            className={styles.createButton}
            disabled={selectedFriends.length < 2 || isCreating}
          >
            {isCreating ? (
              <>
                <div className={styles.spinner} />
                创建中...
              </>
            ) : (
              <>
                <Users size={18} />
                创建
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 