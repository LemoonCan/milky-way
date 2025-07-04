import { create } from 'zustand'
import { momentService } from '../services/moment'
import { fileService, FilePermission } from '../services/file'
import { useUserStore } from './user'
import type { 
  MomentDTO, 
  PublishParam, 
  CommentParam, 
  MomentsQueryParams,
  SimpleUserDTO
} from '../types/api'
import { MomentContentType } from '../types/api'

interface MomentStore {
  // 状态
  moments: MomentDTO[]
  loading: boolean
  error: string | null
  hasNext: boolean
  lastId?: string
  
  // 发布状态
  publishLoading: boolean
  publishError: string | null
  
  // 操作状态
  operationLoading: { [key: string]: boolean }
  
  // 防重复请求
  initialized: boolean
  lastFetchTime: number | null
  
  // 方法
  fetchMoments: (params?: MomentsQueryParams) => Promise<void>
  loadMoreMoments: () => Promise<void>
  refreshMoments: () => Promise<void>
  
  // 发布动态
  publishMoment: (content: string, images?: File[]) => Promise<boolean>
  deleteMoment: (momentId: string) => Promise<boolean>
  
  // 点赞相关
  likeMoment: (momentId: string) => Promise<boolean>
  unlikeMoment: (momentId: string) => Promise<boolean>
  
  // 评论相关
  commentMoment: (momentId: string, content: string, parentCommentId?: string) => Promise<boolean>
  
  // 清理方法
  clearError: () => void
  clearPublishError: () => void
}

export const useMomentStore = create<MomentStore>()((set, get) => ({
  // 初始状态
  moments: [],
  loading: false,
  error: null,
  hasNext: true,
  lastId: undefined,
  
  publishLoading: false,
  publishError: null,
  
  operationLoading: {},
  
  // 防重复请求
  initialized: false,
  lastFetchTime: null,

  // 获取朋友圈动态
  fetchMoments: async (params?: MomentsQueryParams) => {
    const state = get()
    const now = Date.now()
    
    // 如果已经初始化且在短时间内调用，跳过请求（防止 StrictMode 重复调用）
    if (state.initialized && state.lastFetchTime && (now - state.lastFetchTime) < 1000) {
      return
    }
    
    // 如果正在加载中，避免重复请求
    if (state.loading) {
      return
    }
    
    set({ loading: true, error: null })
    
    try {
      const queryParams = {
        lastId: params?.lastId || '',
        pageSize: params?.pageSize || 5
      }
      
      const response = await momentService.getFriendMoments(queryParams)
      
      if (response.success && response.data) {
        set({
          moments: response.data.items,
          hasNext: response.data.hasNext,
          lastId: response.data.lastId,
          loading: false,
          initialized: true,
          lastFetchTime: now
        })
      } else {
        set({
          error: response.msg || '获取动态失败',
          loading: false,
          initialized: true,
          lastFetchTime: now
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取动态失败',
        loading: false,
        initialized: true,
        lastFetchTime: now
      })
    }
  },

  // 加载更多动态
  loadMoreMoments: async () => {
    const state = get()
    
    if (!state.hasNext || state.loading) {
      return
    }
    
    set({ loading: true })
    
    try {
      const response = await momentService.getFriendMoments({
        lastId: state.lastId || '',
        pageSize: 20
      })
      
      if (response.success && response.data) {
        set({
          moments: [...state.moments, ...response.data.items],
          hasNext: response.data.hasNext,
          lastId: response.data.lastId,
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
    // 重置状态，允许重新请求
    set({ initialized: false, lastFetchTime: null })
    const { fetchMoments } = get()
    await fetchMoments()
  },

  // 发布动态
  publishMoment: async (content: string, images?: File[]) => {
    set({ publishLoading: true, publishError: null })
    
    try {
      let imageUrls: string[] = []
      
      // 上传图片
      if (images && images.length > 0) {
        const uploadPromises = images.map(file => 
          fileService.uploadFile(file, { permission: FilePermission.PUBLIC })
        )
        
        const uploadResults = await Promise.all(uploadPromises)
        imageUrls = uploadResults.map(result => result.fileAccessUrl)
      }
      
      // 确定内容类型
      let contentType: MomentContentType
      if (content && imageUrls.length > 0) {
        contentType = MomentContentType.TEXT_IMAGE
      } else if (imageUrls.length > 0) {
        contentType = MomentContentType.IMAGE
      } else {
        contentType = MomentContentType.TEXT
      }
      
      const publishData: PublishParam = {
        text: content || undefined,
        contentType,
        medias: imageUrls.length > 0 ? imageUrls : undefined
      }
      
      const response = await momentService.publish(publishData)
      
      if (response.success) {
        set({ publishLoading: false })
        // 发布成功后刷新动态列表
        await get().refreshMoments()
        return true
      } else {
        set({
          publishError: response.msg || '发布失败',
          publishLoading: false
        })
        return false
      }
    } catch (error) {
      set({
        publishError: error instanceof Error ? error.message : '发布失败',
        publishLoading: false
      })
      return false
    }
  },

  // 删除动态
  deleteMoment: async (momentId: string) => {
    const currentOperations = get().operationLoading
    set({ 
      operationLoading: { ...currentOperations, [momentId]: true } 
    })
    
    try {
      const response = await momentService.deleteMoment(momentId)
      
      if (response.success) {
        // 从列表中移除已删除的动态
        const state = get()
        set({
          moments: state.moments.filter(moment => moment.id !== momentId),
          operationLoading: { ...state.operationLoading, [momentId]: false }
        })
        return true
      } else {
        set({
          error: response.msg || '删除失败',
          operationLoading: { ...get().operationLoading, [momentId]: false }
        })
        return false
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除失败',
        operationLoading: { ...get().operationLoading, [momentId]: false }
      })
      return false
    }
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
        const { currentUser } = useUserStore.getState()
        
        if (currentUser) {
          set({
            moments: state.moments.map(moment => 
              moment.id === momentId 
                ? { 
                    ...moment, 
                    likeUsers: [...(moment.likeUsers || []), {
                      id: currentUser.id,
                      openId: currentUser.openId,
                      nickName: currentUser.nickName,
                      avatar: currentUser.avatar
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
      operationLoading: { ...currentOperations, [`unlike_${momentId}`]: true } 
    })
    
    try {
      const response = await momentService.unlikeMoment(momentId)
      
      if (response.success) {
        // 更新本地状态
        const state = get()
        const { currentUser } = useUserStore.getState()
        
        if (currentUser) {
          set({
            moments: state.moments.map(moment => 
              moment.id === momentId 
                ? { 
                    ...moment, 
                    likeUsers: (moment.likeUsers || []).filter(user => user.id !== currentUser.id)
                  }
                : moment
            ),
            operationLoading: { ...state.operationLoading, [`unlike_${momentId}`]: false }
          })
        }
        return true
      } else {
        set({
          error: response.msg || '取消点赞失败',
          operationLoading: { ...get().operationLoading, [`unlike_${momentId}`]: false }
        })
        return false
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '取消点赞失败',
        operationLoading: { ...get().operationLoading, [`unlike_${momentId}`]: false }
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
      const commentData: CommentParam = {
        momentId,
        content,
        parentCommentId
      }
      
      const response = await momentService.commentMoment(commentData)
      
      if (response.success && response.data) {
        // 更新本地状态（添加新评论）
        const state = get()
        const { currentUser } = useUserStore.getState()
        
        if (currentUser) {
          const newComment = {
            id: response.data, // 使用后端返回的评论ID（直接是数字）
            parentCommentId: parentCommentId ? Number(parentCommentId) : null,
            user: {
              id: currentUser.id,
              openId: currentUser.openId,
              nickName: currentUser.nickName,
              avatar: currentUser.avatar
            },
            content,
            createTime: new Date().toISOString(),
            replyUser: undefined as SimpleUserDTO | undefined  // 使用SimpleUserDTO类型
          }
          
          // 如果是回复评论，需要设置replyUser
          if (parentCommentId) {
            const parentComment = state.moments
              .find(moment => moment.id === momentId)
              ?.comments?.find(comment => comment.id === Number(parentCommentId))
            
            if (parentComment) {
              newComment.replyUser = parentComment.user
            }
          }
          
          set({
            moments: state.moments.map(moment => 
              moment.id === momentId 
                ? { 
                    ...moment, 
                    comments: [...(moment.comments || []), newComment]
                  }
                : moment
            ),
            operationLoading: { ...state.operationLoading, [`comment_${momentId}`]: false }
          })
        }
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

  // 清理错误
  clearError: () => {
    set({ error: null })
  },

  clearPublishError: () => {
    set({ publishError: null })
  }
})) 