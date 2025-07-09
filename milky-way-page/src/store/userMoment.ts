import { create } from 'zustand'
import { momentService } from '../services/moment'
import { useUserStore } from './user'
import type { 
  MomentDTO, 
  MomentsQueryParams,
  SimpleUserDTO,
  CommentDTO
} from '../types/api'



interface UserMomentStore {
  // 状态
  moments: MomentDTO[]
  loading: boolean
  error: string | null
  hasNext: boolean
  lastId?: string
  currentUserId: string | null
  
  // 操作状态
  operationLoading: { [key: string]: boolean }
  
  // 防重复请求
  initialized: boolean
  lastFetchTime: number | null
  
  // 方法
  fetchUserMoments: (userId: string, params?: MomentsQueryParams) => Promise<void>
  loadMoreMoments: () => Promise<void>
  refreshMoments: () => Promise<void>
  
  // 点赞相关
  likeMoment: (momentId: string) => Promise<boolean>
  unlikeMoment: (momentId: string) => Promise<boolean>
  
  // 评论相关
  commentMoment: (momentId: string, content: string, parentCommentId?: string) => Promise<boolean>
  
  // 本地更新方法
  addLikeLocally: (momentId: string, likeUser: SimpleUserDTO) => void
  addCommentLocally: (momentId: string, comment: CommentDTO) => void
  removeLikeLocally: (momentId: string, userId: string) => void
  
  // 清理方法
  clearError: () => void
  resetState: () => void
}

export const useUserMomentStore = create<UserMomentStore>()((set, get) => ({
  // 初始状态
  moments: [],
  loading: false,
  error: null,
  hasNext: true,
  lastId: undefined,
  currentUserId: null,
  
  operationLoading: {},
  
  // 防重复请求
  initialized: false,
  lastFetchTime: null,

  // 获取用户动态
  fetchUserMoments: async (userId: string, params?: MomentsQueryParams) => {
    const state = get()
    
    // 如果正在加载中，避免重复请求
    if (state.loading) {
      return
    }
    
    // 如果切换了用户，重置状态
    if (state.currentUserId !== userId) {
      set({ 
        moments: [], 
        initialized: false, 
        lastFetchTime: null,
        currentUserId: userId,
        lastId: undefined,
        hasNext: true,
        loading: false,
        error: null
      })
    }
    
    // 对于相同用户，如果已经有数据，跳过请求
    if (state.currentUserId === userId && state.initialized && state.moments.length > 0) {
      return
    }
    
    set({ loading: true, error: null, currentUserId: userId })
    
    try {
      const queryParams = {
        lastId: params?.lastId || '',
        pageSize: params?.pageSize || 20
      }
      
      const response = await momentService.getUserMoments(userId, queryParams)

      if (response.success && response.data) {
        const items = response.data.items
        // 如果后端没有返回有效的lastId，从数据末尾提取
        let finalLastId = response.data.lastId
        if (!finalLastId || finalLastId === 'undefined' || finalLastId === 'null') {
          finalLastId = items.length > 0 ? items[items.length - 1].id : ''
        }
        
        set({
          moments: items,
          hasNext: response.data.hasNext,
          lastId: finalLastId,
          loading: false,
          initialized: true,
          lastFetchTime: Date.now()
        })
      } else {
        set({
          error: response.msg || '获取用户动态失败',
          loading: false,
          initialized: true,
          lastFetchTime: Date.now()
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取用户动态失败',
        loading: false,
        initialized: true,
        lastFetchTime: Date.now()
      })
    }
  },

  // 加载更多动态
  loadMoreMoments: async () => {
    const state = get()
    
    if (!state.hasNext || state.loading || !state.currentUserId) {
      return
    }
    
    const currentLastId = state.lastId || ''
    
    set({ loading: true })
    
    try {
      const response = await momentService.getUserMoments(state.currentUserId, {
        lastId: currentLastId,
        pageSize: 20
      })
      
      if (response.success && response.data) {
        const newItems = response.data.items
        // 如果后端没有返回有效的lastId，从新数据末尾提取
        let finalLastId = response.data.lastId
        if (!finalLastId || finalLastId === 'undefined' || finalLastId === 'null') {
          finalLastId = newItems.length > 0 ? newItems[newItems.length - 1].id : state.lastId
        }
        
        set({
          moments: [...state.moments, ...newItems],
          hasNext: response.data.hasNext,
          lastId: finalLastId,
          loading: false
        })
      } else {
        set({
          error: response.msg || '加载更多失败',
          loading: false
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载更多失败',
        loading: false
      })
    }
  },

  // 刷新动态
  refreshMoments: async () => {
    const state = get()
    if (!state.currentUserId) return
    
    // 重置状态，允许重新请求
    set({ initialized: false, lastFetchTime: null })
    await get().fetchUserMoments(state.currentUserId)
  },

  // 点赞动态
  likeMoment: async (momentId: string) => {
    const currentOperations = get().operationLoading
    set({ 
      operationLoading: { ...currentOperations, [`like_${momentId}`]: true } 
    })
    
    try {
      const response = await momentService.likeMoment(momentId)
      
      if (response.success && response.data) {
        // 更新本地状态
        const state = get()
        const user = useUserStore.getState().currentUser
        
        if (user) {
          set({
            moments: state.moments.map(moment => 
              moment.id === momentId 
                ? { 
                    ...moment, 
                    likeUsers: [...(moment.likeUsers || []), {
                      id: user.id,
                      openId: user.openId,
                      nickName: user.nickName,
                      avatar: user.avatar
                    }]
                  }
                : moment
            ),
            operationLoading: { ...state.operationLoading, [`like_${momentId}`]: false }
          })
        }
        return true
      } else {
        set({
          error: response.msg || '点赞失败',
          operationLoading: { ...get().operationLoading, [`like_${momentId}`]: false }
        })
        return false
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '点赞失败',
        operationLoading: { ...get().operationLoading, [`like_${momentId}`]: false }
      })
      return false
    }
  },

  // 取消点赞
  unlikeMoment: async (momentId: string) => {
    const currentOperations = get().operationLoading
    set({ 
      operationLoading: { ...currentOperations, [`like_${momentId}`]: true } 
    })
    
    try {
      const response = await momentService.unlikeMoment(momentId)
      
      if (response.success) {
        // 更新本地状态
        const state = get()
        const user = useUserStore.getState().currentUser
        
        if (user) {
          set({
            moments: state.moments.map(moment => 
              moment.id === momentId 
                ? { 
                    ...moment, 
                    likeUsers: (moment.likeUsers || []).filter(u => u.id !== user.id)
                  }
                : moment
            ),
            operationLoading: { ...state.operationLoading, [`like_${momentId}`]: false }
          })
        }
        return true
      } else {
        set({
          error: response.msg || '取消点赞失败',
          operationLoading: { ...get().operationLoading, [`like_${momentId}`]: false }
        })
        return false
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '取消点赞失败',
        operationLoading: { ...get().operationLoading, [`like_${momentId}`]: false }
      })
      return false
    }
  },

  // 评论动态
  commentMoment: async (momentId: string, content: string, parentCommentId?: string) => {
    const currentOperations = get().operationLoading
    set({ 
      operationLoading: { ...currentOperations, [`comment_${momentId}`]: true } 
    })
    
    try {
      const response = await momentService.commentMoment({
        momentId,
        content,
        parentCommentId
      })
      
      if (response.success && response.data) {
        set({
          operationLoading: { ...get().operationLoading, [`comment_${momentId}`]: false }
        })
        return true
      } else {
        set({
          error: response.msg || '评论失败',
          operationLoading: { ...get().operationLoading, [`comment_${momentId}`]: false }
        })
        return false
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '评论失败',
        operationLoading: { ...get().operationLoading, [`comment_${momentId}`]: false }
      })
      return false
    }
  },

  // 本地添加点赞
  addLikeLocally: (momentId: string, likeUser: SimpleUserDTO) => {
    const state = get()
    set({
      moments: state.moments.map(moment => 
        moment.id === momentId 
          ? { 
              ...moment, 
              likeUsers: [...(moment.likeUsers || []), likeUser]
            }
          : moment
      )
    })
  },

  // 本地添加评论
  addCommentLocally: (momentId: string, comment: CommentDTO) => {
    const state = get()
    set({
      moments: state.moments.map(moment => 
        moment.id === momentId 
          ? { 
              ...moment, 
              comments: [...(moment.comments || []), comment]
            }
          : moment
      )
    })
  },

  // 本地移除点赞
  removeLikeLocally: (momentId: string, userId: string) => {
    const state = get()
    set({
      moments: state.moments.map(moment => 
        moment.id === momentId 
          ? { 
              ...moment, 
              likeUsers: (moment.likeUsers || []).filter(u => u.id !== userId)
            }
          : moment
      )
    })
  },

  // 清理错误
  clearError: () => {
    set({ error: null })
  },

  // 重置状态
  resetState: () => {
    set({
      moments: [],
      loading: false,
      error: null,
      hasNext: true,
      lastId: undefined,
      currentUserId: null,
      operationLoading: {},
      initialized: false,
      lastFetchTime: null
    })
  }
})) 