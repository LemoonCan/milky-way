import { create } from 'zustand'
import { friendService } from '../services'
import type { Friend, FriendApplication, User, FriendRelation } from '../types/api'

interface FriendState {
  // 状态
  friends: Friend[]
  friendApplications: FriendApplication[]
  selectedFriend: Friend | null
  isLoading: boolean
  isFriendsLoading: boolean
  isApplicationsLoading: boolean
  error: string | null
  hasNextPage: boolean

  // 操作方法
  setSelectedFriend: (friend: Friend | null) => void
  fetchFriends: (refresh?: boolean) => Promise<void>
  fetchMoreFriends: () => Promise<void>
  fetchFriendApplications: () => Promise<void>
  addFriend: (toUserId: string, applyMessage: string, extraInfo?: { remark?: string; permission?: 'ALL' | 'CHAT' }) => Promise<void>
  handleFriendApplication: (applicationId: string, action: 'accept' | 'reject') => Promise<void>
  deleteFriend: (friendId: string) => Promise<void>
  blockFriend: (friendId: string) => Promise<void>
  unblockFriend: (friendId: string) => Promise<void>
  searchUserByOpenId: (openId: string) => Promise<User | null>
  searchUserByPhone: (phone: string) => Promise<User | null>
  clearError: () => void
}

export const useFriendStore = create<FriendState>((set, get) => ({
  // 初始状态
  friends: [],
  friendApplications: [],
  selectedFriend: null,
  isLoading: false,
  isFriendsLoading: false,
  isApplicationsLoading: false,
  error: null,
  hasNextPage: false,

  // 设置选中的好友
  setSelectedFriend: (friend) => set({ selectedFriend: friend }),

  // 获取好友列表
  fetchFriends: async () => {
    const currentState = get()
    // 如果正在加载好友列表，避免重复请求
    if (currentState.isFriendsLoading) {
      return
    }
    
    set({ isFriendsLoading: true, error: null })
    
    try {
      const params = { pageSize: 20 }
      const response = await friendService.getFriends(params)
      
      if (response.success && response.data) {
        // 转换数据结构以匹配组件预期的格式
        const transformedFriends: Friend[] = response.data.data.map((relation: FriendRelation) => ({
          id: relation.friend.id,
          openId: relation.friend.openId,
          nickName: relation.friend.nickName,
          nickNameFirstLetter: relation.friend.nickNameFirstLetter,
          avatar: relation.friend.avatar,
          remark: relation.remark,
          status: relation.status,
          permission: relation.permission
        }))
        
        set({
          friends: transformedFriends,
          hasNextPage: response.data.hasNext,
          isFriendsLoading: false
        })
      } else {
        set({ error: response.msg || '获取好友列表失败', isFriendsLoading: false })
      }
    } catch {
      set({ error: '网络错误，请重试', isFriendsLoading: false })
    }
  },

  // 加载更多好友
  fetchMoreFriends: async () => {
    if (get().isFriendsLoading || !get().hasNextPage) return
    await get().fetchFriends(false)
  },

  // 获取好友申请列表
  fetchFriendApplications: async () => {
    const currentState = get()
    // 如果正在加载申请列表，避免重复请求
    if (currentState.isApplicationsLoading) {
      return
    }
    
    set({ isApplicationsLoading: true, error: null })
    
    try {
      const response = await friendService.getFriendApplications()
      
      if (response.success && response.data) {
        set({ friendApplications: response.data, isApplicationsLoading: false })
      } else {
        set({ error: response.msg || '获取好友申请失败', isApplicationsLoading: false })
      }
    } catch {
      set({ error: '网络错误，请重试', isApplicationsLoading: false })
    }
  },

  // 添加好友
  addFriend: async (toUserId, applyMessage, extraInfo) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.addFriend({ toUserId, applyMessage, extraInfo })
      
      if (response.success) {
        set({ isLoading: false })
        // 刷新好友申请列表
        await get().fetchFriendApplications()
      } else {
        set({ error: response.msg || '添加好友失败', isLoading: false })
      }
    } catch {
      set({ error: '网络错误，请重试', isLoading: false })
    }
  },

  // 处理好友申请
  handleFriendApplication: async (applicationId, action) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.handleFriendApplication({ applicationId, action })
      
      if (response.success) {
        set({ isLoading: false })
        // 刷新好友列表和申请列表
        await Promise.all([
          get().fetchFriends(true),
          get().fetchFriendApplications()
        ])
      } else {
        set({ error: response.msg || '处理好友申请失败', isLoading: false })
      }
    } catch {
      set({ error: '网络错误，请重试', isLoading: false })
    }
  },

  // 删除好友
  deleteFriend: async (friendOpenId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.deleteFriend(friendOpenId)
      
      if (response.success) {
        set({ 
          friends: get().friends.filter(f => f.openId !== friendOpenId),
          selectedFriend: get().selectedFriend?.openId === friendOpenId ? null : get().selectedFriend,
          isLoading: false 
        })
      } else {
        set({ error: response.msg || '删除好友失败', isLoading: false })
      }
    } catch {
      set({ error: '网络错误，请重试', isLoading: false })
    }
  },

  // 拉黑好友
  blockFriend: async (friendOpenId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.blockFriend(friendOpenId)
      
      if (response.success) {
        set({ 
          friends: get().friends.map(f => 
            f.openId === friendOpenId ? { ...f, status: 'BLOCKED' } : f
          ),
          isLoading: false 
        })
      } else {
        set({ error: response.msg || '拉黑好友失败', isLoading: false })
      }
    } catch {
      set({ error: '网络错误，请重试', isLoading: false })
    }
  },

  // 解除拉黑
  unblockFriend: async (friendOpenId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.unblockFriend(friendOpenId)
      
      if (response.success) {
        set({ 
          friends: get().friends.map(f => 
            f.openId === friendOpenId ? { ...f, status: 'ESTABLISHED' } : f
          ),
          isLoading: false 
        })
      } else {
        set({ error: response.msg || '解除拉黑失败', isLoading: false })
      }
    } catch {
      set({ error: '网络错误，请重试', isLoading: false })
    }
  },

  // 通过OpenID搜索用户
  searchUserByOpenId: async (openId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.searchUserByOpenId(openId)
      set({ isLoading: false })
      
      if (response.success && response.data) {
        return response.data
      } else {
        // 搜索结果为空不应该设置全局错误，由调用方处理
        return null
      }
    } catch(error) {
      set({ error: '网络错误，请重试', isLoading: false })
      throw error
    }
  },

  // 通过手机号搜索用户
  searchUserByPhone: async (phone) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.searchUserByPhone(phone)
      set({ isLoading: false })
      
      if (response.success && response.data) {
        return response.data
      } else {
        // 搜索结果为空不应该设置全局错误，由调用方处理
        return null
      }
    } catch {
      set({ error: '网络错误，请重试', isLoading: false })
      return null
    }
  },

  // 清除错误
  clearError: () => set({ error: null })
})) 