import { create } from 'zustand'
import { momentService } from '../services/moment'
import { fileService, FilePermission } from '../services/file'
import { useUserStore } from './user'
import { getErrorMessage } from '../lib/error-handler'
import type { 
  MomentDTO, 
  PublishParam, 
  CommentParam, 
  MomentsQueryParams,
  SimpleUserDTO,
  CommentDTO
} from '../types/api'
import { MomentContentType } from '../types/api'

interface MomentStore {
  // 状态
  moments: MomentDTO[]
  loading: boolean
  error: string | null
  hasNext: boolean
  lastId?: string
  
  // 动态类型状态
  momentType: 'friends' | 'mine'
  
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
  fetchMyMoments: (params?: MomentsQueryParams) => Promise<void>
  loadMoreMoments: () => Promise<void>
  refreshMoments: () => Promise<void>
  setMomentType: (type: 'friends' | 'mine') => void
  
  // 发布动态
  publishMoment: (content: string, images?: File[]) => Promise<boolean>
  deleteMoment: (momentId: string) => Promise<boolean>
  
  // 点赞相关
  likeMoment: (momentId: string) => Promise<boolean>
  unlikeMoment: (momentId: string) => Promise<boolean>
  
  // 评论相关
  commentMoment: (momentId: string, content: string, parentCommentId?: string) => Promise<boolean>
  
  // 新增：本地更新方法（用于通知）
  addLikeLocally: (momentId: string, likeUser: SimpleUserDTO) => void
  addCommentLocally: (momentId: string, comment: CommentDTO) => void
  removeLikeLocally: (momentId: string, userId: string) => void
  addMomentLocally: (moment: MomentDTO) => void
  removeMomentLocally: (momentId: string) => void
  
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
  
  // 动态类型状态
  momentType: 'friends' as const,
  
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
        pageSize: params?.pageSize || 20
      }
      
      const response = await momentService.getFriendMoments(queryParams)
      
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
        error: getErrorMessage(error),
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
    
    const currentLastId = state.lastId || ''
    
    set({ loading: true })
    
    try {
      const response = state.momentType === 'mine'
        ? await momentService.getMyMoments({
            lastId: currentLastId,
            pageSize: 20
          })
        : await momentService.getFriendMoments({
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
    // 重置状态，允许重新请求
    set({ initialized: false, lastFetchTime: null })
    const { momentType } = get()
    if (momentType === 'mine') {
      await get().fetchMyMoments()
    } else {
      await get().fetchMoments()
    }
  },

  // 获取我的动态
  fetchMyMoments: async (params?: MomentsQueryParams) => {
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
        pageSize: params?.pageSize || 20
      }
      
      const response = await momentService.getMyMoments(queryParams)
      
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
          lastFetchTime: now
        })
      } else {
        set({
          error: response.msg || '获取我的动态失败',
          loading: false,
          initialized: true,
          lastFetchTime: now
        })
      }
    } catch (error) {
      set({
        error: getErrorMessage(error),
        loading: false,
        initialized: true,
        lastFetchTime: now
      })
    }
  },

  // 设置动态类型
  setMomentType: (type: 'friends' | 'mine') => {
    set({ momentType: type, initialized: false, lastFetchTime: null })
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

  // 新增：本地更新方法（用于通知）
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

  removeLikeLocally: (momentId: string, userId: string) => {
    const state = get()
    set({
      moments: state.moments.map(moment => 
        moment.id === momentId
          ? {
              ...moment,
              likeUsers: moment.likeUsers?.filter(user => user.id !== userId)
            }
          : moment
      )
    })
  },

  addMomentLocally: (moment: MomentDTO) => {
    const state = get()
    // 检查是否已存在相同ID的动态，避免重复添加
    const exists = state.moments.some(existingMoment => existingMoment.id === moment.id)
    if (exists) {
      return
    }
    
    set({
      moments: [moment, ...state.moments]
    })
  },

  removeMomentLocally: (momentId: string) => {
    const state = get()
    const beforeCount = state.moments.length
    const newMoments = state.moments.filter(moment => moment.id !== momentId)
    const afterCount = newMoments.length
    
    set({
      moments: newMoments
    })
    
    if (beforeCount === afterCount) {
      // 动态未找到，可能已被删除
      return
    } else if (afterCount === 0 && state.hasNext) {
      // 如果删除后动态数量为0且还有更多数据，触发加载更多而不是重新刷新
      const { loadMoreMoments } = get()
      loadMoreMoments()
    } else if (afterCount === 0 && !state.hasNext) {
      // 如果没有更多数据了，才触发完整刷新
      const { refreshMoments } = get()
      refreshMoments()
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