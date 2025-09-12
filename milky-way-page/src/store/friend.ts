import { create } from 'zustand'
import { friendService } from '../services'
import type { Friend } from '../services/friend'
import type { FriendApplication } from '../services/friend'
import type { User } from '../services/user'

interface FriendState {
  // 状态
  friends: Friend[]
  friendApplications: FriendApplication[]
  selectedFriend: Friend | null
  selectedFriendApplication: FriendApplication | null
  isLoading: boolean
  isFriendsLoading: boolean
  isApplicationsLoading: boolean
  error: string | null
  hasNextPage: boolean
  hasNextApplicationsPage: boolean
  // 新增：游标分页状态
  lastLetter: string | null
  lastNickName: string | null
  lastApplicationId: string | null
  // 好友总数
  totalFriendsCount: number
  isCountLoading: boolean
  // 新增：好友申请数量
  pendingApplicationsCount: number
  isApplicationCountLoading: boolean

  // 操作方法
  setSelectedFriend: (friend: Friend | null) => void
  setSelectedFriendApplication: (application: FriendApplication | null) => void
  fetchFriends: (refresh?: boolean) => Promise<void>
  fetchMoreFriends: () => Promise<void>
  fetchFriendApplications: (refresh?: boolean) => Promise<void>
  fetchMoreFriendApplications: () => Promise<void>
  addFriend: (toUserId: string, applyMessage: string, applyChannel?: string, extraInfo?: { remark?: string; permission?: 'ALL' | 'CHAT' }) => Promise<void>
  handleFriendApplication: (applicationId: string, action: 'accept' | 'reject', extraInfo?: { remark?: string; permission?: 'ALL' | 'CHAT' }) => Promise<boolean>
  deleteFriend: (friendUserId: string) => Promise<void>
  blockFriend: (friendUserId: string) => Promise<void>
  unblockFriend: (friendUserId: string) => Promise<void>
  searchUserByOpenId: (openId: string) => Promise<User | null>
  searchUserByPhone: (phone: string) => Promise<User | null>
  fetchFriendsCount: () => Promise<void>
  // 新增：获取好友申请数量
  fetchApplicationsCount: () => Promise<void>
  clearError: () => void
  
  // 本地数据更新方法
  addFriendApplicationLocally: (application: FriendApplication) => void
  addFriendLocally: (friendRelation: Friend) => void
}

export const useFriendStore = create<FriendState>((set, get) => ({
  // 初始状态
  friends: [],
  friendApplications: [],
  selectedFriend: null,
  selectedFriendApplication: null,
  isLoading: false,
  isFriendsLoading: false,
  isApplicationsLoading: false,
  error: null,
  hasNextPage: false,
  hasNextApplicationsPage: false,
  // 新增：游标分页状态初始化
  lastLetter: null,
  lastNickName: null,
  lastApplicationId: null,
  // 好友总数
  totalFriendsCount: 0,
  isCountLoading: false,
  // 新增：好友申请数量初始化
  pendingApplicationsCount: 0,
  isApplicationCountLoading: false,

  // 设置选中的好友
  setSelectedFriend: (friend) => set({ selectedFriend: friend }),

  // 设置选中的好友申请
  setSelectedFriendApplication: (application) => set({ selectedFriendApplication: application }),

  // 获取好友列表
  fetchFriends: async (refresh = true) => {
    const currentState = get()
    // 如果正在加载好友列表，避免重复请求
    if (currentState.isFriendsLoading) {
      return
    }
    
    set({ isFriendsLoading: true, error: null })
    
    try {
      // 构建请求参数
      const params: { pageSize: number; lastLetter?: string; lastNickName?: string } = { pageSize: 10 }
      
      // 如果不是刷新操作，使用游标参数
      if (!refresh && currentState.lastLetter && currentState.lastNickName) {
        params.lastLetter = currentState.lastLetter
        params.lastNickName = currentState.lastNickName
      }
      
      const response = await friendService.getFriends(params)
      
      if (response.success && response.data) {
        // 直接使用嵌套的Friend结构
        const transformedFriends: Friend[] = response.data.items
        
        // 更新游标信息
        let newLastLetter = null
        let newLastNickName = null
        
        if (transformedFriends.length > 0) {
          const lastFriend = transformedFriends[transformedFriends.length - 1]
          newLastLetter = lastFriend.friend.nickNameFirstLetter
          newLastNickName = lastFriend.friend.nickName
        }
        
        set({
          friends: refresh ? transformedFriends : [...currentState.friends, ...transformedFriends],
          hasNextPage: response.data.hasNext,
          lastLetter: newLastLetter,
          lastNickName: newLastNickName,
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
    const currentState = get()
    if (currentState.isFriendsLoading || !currentState.hasNextPage) return
    await get().fetchFriends(false)
  },

  // 获取好友申请列表
  fetchFriendApplications: async (refresh = true) => {
    const currentState = get()
    // 如果正在加载好友申请列表，避免重复请求
    if (currentState.isApplicationsLoading) {
      return
    }
    
    set({ isApplicationsLoading: true, error: null })
    
    try {
      const params: { pageSize: number; lastId?: string } = {
        pageSize: 10
      }
      
      // 如果不是刷新操作，使用游标参数
      if (!refresh && currentState.lastApplicationId) {
        params.lastId = currentState.lastApplicationId
      }
      
      const response = await friendService.getFriendApplications(params)
      console.log('好友申请列表API响应:', response)
      
      if (response.success && response.data) {
        // 更新游标信息
        let newLastApplicationId = null
        
        if (response.data.items.length > 0) {
          const lastApplication = response.data.items[response.data.items.length - 1]
          newLastApplicationId = lastApplication.id
        }
        
        const newApplications = refresh ? response.data.items : [...currentState.friendApplications, ...response.data.items]
        console.log(`更新好友申请列表，旧数量: ${currentState.friendApplications.length}，新数量: ${newApplications.length}`)
        
        set({ 
          friendApplications: newApplications,
          hasNextApplicationsPage: response.data.hasNext,
          lastApplicationId: newLastApplicationId,
          isApplicationsLoading: false 
        })
      } else {
        set({ error: response.msg || '获取好友申请失败', isApplicationsLoading: false })
      }
    } catch(error) {
      console.error('获取好友申请列表失败:', error)
      set({ error: '网络错误，请重试', isApplicationsLoading: false })
    }
  },

  // 加载更多好友申请
  fetchMoreFriendApplications: async () => {
    const currentState = get()
    if (currentState.isApplicationsLoading || !currentState.hasNextApplicationsPage) return
    await get().fetchFriendApplications(false)
  },

  // 添加好友
  addFriend: async (toUserId, applyMessage, applyChannel, extraInfo) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.addFriend({ toUserId, applyMessage, applyChannel, extraInfo })
      
      if (response.success) {
        set({ isLoading: false })
        // 刷新好友申请列表
        await get().fetchFriendApplications(true)
      } else {
        set({ error: response.msg || '添加好友失败', isLoading: false })
      }
    } catch {
      set({ error: '网络错误，请重试', isLoading: false })
    }
  },

  // 处理好友申请
  handleFriendApplication: async (applicationId, action, extraInfo) => {
    set({ isLoading: true, error: null })
    
    try {
      // 转换action为后端期望的status格式
      const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED'
      const response = await friendService.handleFriendApplication({ 
        friendApplicationId: applicationId, 
        status,
        extraInfo
      })
      
      if (response.success) {
        set({ isLoading: false })
        // 刷新好友列表和申请列表，并更新好友总数和申请数量
        await Promise.all([
          get().fetchFriends(true),
          get().fetchFriendApplications(true),
          get().fetchFriendsCount(),
          get().fetchApplicationsCount()
        ])
        return true // 返回成功标识
      } else {
        set({ error: response.msg || '处理好友申请失败', isLoading: false })
        return false // 返回失败标识
      }
    } catch {
      set({ error: '网络错误，请重试', isLoading: false })
      return false // 返回失败标识
    }
  },

  // 删除好友
  deleteFriend: async (friendUserId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.deleteFriend(friendUserId)
      
      if (response.success) {
        set({ 
          friends: get().friends.filter(f => f.friend.id !== friendUserId),
          selectedFriend: get().selectedFriend?.friend.id === friendUserId ? null : get().selectedFriend,
          isLoading: false 
        })
        // 更新好友总数
        get().fetchFriendsCount()
      } else {
        set({ error: response.msg || '删除好友失败', isLoading: false })
      }
    } catch {
      set({ error: '网络错误，请重试', isLoading: false })
    }
  },

  // 拉黑好友
  blockFriend: async (friendUserId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.blockFriend(friendUserId)
      
      if (response.success) {
        const updatedFriends = get().friends.map(f =>
          f.friend.id === friendUserId ? { ...f, status: 'BLACKLISTED' as const } : f
        )
        const updatedSelectedFriend = get().selectedFriend?.friend.id === friendUserId
          ? { ...get().selectedFriend!, status: 'BLACKLISTED' as const }
          : get().selectedFriend
        
        set({ 
          friends: updatedFriends,
          selectedFriend: updatedSelectedFriend,
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
  unblockFriend: async (friendUserId) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await friendService.unblockFriend(friendUserId)
      
      if (response.success) {
        const updatedFriends = get().friends.map(f => 
          f.friend.id === friendUserId ? { ...f, status: 'ESTABLISHED' as const } : f
        )
        const updatedSelectedFriend = get().selectedFriend?.friend.id === friendUserId
          ? { ...get().selectedFriend!, status: 'ESTABLISHED' as const }
          : get().selectedFriend
        
        set({ 
          friends: updatedFriends,
          selectedFriend: updatedSelectedFriend,
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

  // 获取好友总数
  fetchFriendsCount: async () => {
    const currentState = get()
    // 如果正在加载，避免重复请求
    if (currentState.isCountLoading) {
      return
    }

    set({ isCountLoading: true })
    
    try {
      const response = await friendService.countFriends()
      
      if (response.success && typeof response.data === 'number') {
        set({ totalFriendsCount: response.data, isCountLoading: false })
      } else {
        set({ isCountLoading: false })
      }
    } catch (error) {
      console.error('获取好友总数失败:', error)
      set({ isCountLoading: false })
      // 不设置全局错误，因为这不是关键功能
    }
  },

  // 获取好友申请数量
  fetchApplicationsCount: async () => {
    const currentState = get()
    // 如果正在加载，避免重复请求
    if (currentState.isApplicationCountLoading) {
      return
    }

    set({ isApplicationCountLoading: true })
    
    try {
             const response = await friendService.countApplications()
      
      if (response.success && typeof response.data === 'number') {
        set({ pendingApplicationsCount: response.data, isApplicationCountLoading: false })
      } else {
        set({ isApplicationCountLoading: false })
      }
    } catch (error) {
      console.error('获取好友申请数量失败:', error)
      set({ isApplicationCountLoading: false })
    }
  },

  // 清除错误
  clearError: () => set({ error: null }),

  // 本地数据更新方法
  addFriendApplicationLocally: (application) => {
    const currentState = get()
    console.log(`[Friend Store] 本地添加好友申请，当前列表长度: ${currentState.friendApplications.length}`)
    console.log(`[Friend Store] 新申请信息:`, application)
    
    // 检查是否已存在相同ID的申请，避免重复添加
    const existingIndex = currentState.friendApplications.findIndex(app => app.id === application.id)
    if (existingIndex !== -1) {
      console.log('[Friend Store] 好友申请已存在，跳过添加')
      return
    }
    
    // 将新申请添加到列表最前面
    const newApplications = [application, ...currentState.friendApplications]
    console.log(`[Friend Store] 新申请已添加到列表最前面，新列表长度: ${newApplications.length}`)
    console.log(`[Friend Store] 新列表内容:`, newApplications.map(app => ({ id: app.id, nickName: app.fromUser.nickName, status: app.status })))
    
    set({ friendApplications: newApplications })
    
    // 如果是待处理状态的申请，更新申请数量
    if (application.status === 'APPLYING') {
      set({ pendingApplicationsCount: currentState.pendingApplicationsCount + 1 })
    }
    
    // 验证状态是否真的更新了
    setTimeout(() => {
      const updatedState = get()
      console.log(`[Friend Store] 状态更新后验证，列表长度: ${updatedState.friendApplications.length}`)
    }, 100)
  },

  // 本地添加好友
  addFriendLocally: (friendRelation) => {
    const currentState = get()
    console.log(`[Friend Store] 本地添加好友，当前列表长度: ${currentState.friends.length}`)
    console.log(`[Friend Store] 新好友信息:`, friendRelation)
    
    // 检查是否已存在相同ID的好友，避免重复添加
    const existingIndex = currentState.friends.findIndex(friend => friend.friend.id === friendRelation.friend.id)
    if (existingIndex !== -1) {
      console.log('[Friend Store] 好友已存在，跳过添加')
      return
    }
    
    // 直接使用嵌套的Friend结构
    const newFriend: Friend = friendRelation
    
    // 根据首字母排序插入到正确位置
    const newFriends = [...currentState.friends, newFriend].sort((a, b) => {
      // 先按首字母排序
      const aLetter = a.friend.nickNameFirstLetter || ''
      const bLetter = b.friend.nickNameFirstLetter || ''
      const letterCompare = aLetter.localeCompare(bLetter)
      if (letterCompare !== 0) return letterCompare
      // 再按昵称排序
      return a.friend.nickName.localeCompare(b.friend.nickName)
    })
    
    console.log(`[Friend Store] 新好友已添加到列表，新列表长度: ${newFriends.length}`)
    console.log(`[Friend Store] 新列表内容:`, newFriends.map(friend => ({ id: friend.friend.id, nickName: friend.friend.nickName, status: friend.status })))
    
    set({ 
      friends: newFriends,
      totalFriendsCount: currentState.totalFriendsCount + 1
    })
    
    // 验证状态是否真的更新了
    setTimeout(() => {
      const updatedState = get()
      console.log(`[Friend Store] 状态更新后验证，列表长度: ${updatedState.friends.length}`)
    }, 100)
  }
})) 