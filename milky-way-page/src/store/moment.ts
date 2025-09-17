import { create } from 'zustand'
import { momentService } from '../services/moment'
import { fileService, FilePermission } from '../services/file'
import { useUserStore } from './user'
import { handleAndShowError } from '../lib/globalErrorHandler'
import type { 
  MomentDTO, 
  PublishParam, 
  CommentParam, 
  MomentsQueryParams,
  CommentDTO
} from '../services/moment'
import { MomentContentType } from '../services/moment'
import type { SimpleUserDTO, UserDetailInfo } from '../services/user'
import type { NavigateFunction } from 'react-router-dom'
import type { ApiResponse, Slices } from '../types/api'

// 动态类型枚举
export enum MomentType {
  FRIEND = 'friend',
  MINE = 'mine',
  USER = 'user'
}

interface MomentStore {
  // 状态
  moments: MomentDTO[]
  hasNext: boolean
  lastId?: string
  
  loading: boolean
  
  // 发布状态
  publishLoading: boolean
  
  // 操作状态
  operationLoading: { [key: string]: boolean }
  
  // 方法
  getMoments: (momentType: MomentType, queryParams: MomentsQueryParams,userId?: string) => Promise<ApiResponse<Slices<MomentDTO>>>
  fetchMoments: (momentType: MomentType, userId?: string, params?: MomentsQueryParams) => Promise<void>
  loadMoreMoments: (momentType: MomentType, userId?: string) => Promise<void>
  
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
  
  // 导航方法
  navigateToMomentPage: (momentType: MomentType, navigate:NavigateFunction, userInfo?:UserDetailInfo | null) => void
}

export const useMomentStore = create<MomentStore>()((set, get) => ({
  // 初始状态
  moments: [],
  loading: false,
  hasNext: true,
  lastId: undefined,
  
  publishLoading: false,
  operationLoading: {},

  getMoments: async (momentType: MomentType, queryParams: MomentsQueryParams,userId?: string): Promise<ApiResponse<Slices<MomentDTO>>> => {
    let response
    switch (momentType) {
      case MomentType.MINE:
        response = await momentService.getMyMoments(queryParams)
        break
      case MomentType.USER:
        if (!userId) {
          throw new Error('获取用户动态需要提供用户ID')
        } 
        response = await momentService.getUserMoments(userId, queryParams)
        break
      case MomentType.FRIEND:
      default:
        response = await momentService.getFriendMoments(queryParams)
        break
    }
    return response
  },

  // 统一的获取动态方法
  fetchMoments: async (momentType: MomentType, userId?: string, params?: MomentsQueryParams) => {
    const state = get()
    
    // 如果正在加载中，避免重复请求
    if (state.loading) {
      return
    }
    
    set({ 
      loading: true
    })
    
    try {
      const queryParams = {
        lastId: params?.lastId || '',
        pageSize: params?.pageSize || 20
      }
      const response = await get().getMoments(momentType, queryParams, userId)
      if (response.success && response.data) {
        const items = response.data.items
        set({
          moments: items,
          hasNext: response.data.hasNext,
          lastId: items.length > 0 ? items[items.length - 1].id : '',
          loading: false
        })
      } else {
        // 使用全局错误处理显示错误
        handleAndShowError(new Error("动态查询失败"))
        set({
          loading: false
        })
      }
    } catch (error) {
      handleAndShowError(error)
      set({
        loading: false
      })
    }
  },

  // 加载更多动态
  loadMoreMoments: async (momentType: MomentType, userId?: string) => {
    const state = get()
    
    if (!state.hasNext || state.loading) {
      return
    }
    
    const currentLastId = state.lastId || ''
    
    set({ loading: true })
    
    try {
      const response = await get().getMoments(momentType, {
        lastId: currentLastId,
        pageSize: 20
      }, userId)
      if (response.success && response.data) {
        const newItems = response.data.items
        
        set({
          moments: [...state.moments, ...newItems],
          hasNext: response.data.hasNext,
          lastId: newItems.length > 0 ? newItems[newItems.length - 1].id : state.lastId,
          loading: false
        })
      } else {
        // 使用全局错误处理显示错误
        handleAndShowError(new Error(response.msg || '加载更多失败'))
        set({
          loading: false
        })
      }
    } catch (error) {
      // 使用全局错误处理显示错误
      handleAndShowError(error)
      set({
        loading: false
      })
    }
  },

  // 发布动态
  publishMoment: async (content: string, images?: File[]) => {
    set({ publishLoading: true })
    
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
        // 发布成功后需要在组件中手动刷新，因为不知道当前的momentType
        return true
      } else {
        // 使用全局错误处理显示错误
        handleAndShowError(new Error(response.msg || '发布失败'))
        set({
          publishLoading: false
        })
        return false
      }
    } catch (error) {
      // 使用全局错误处理显示错误
      handleAndShowError(error)
      set({
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
        // 使用全局错误处理显示错误
        handleAndShowError(new Error(response.msg || '删除失败'))
        set({
          operationLoading: { ...get().operationLoading, [momentId]: false }
        })
        return false
      }
    } catch (error) {
      // 使用全局错误处理显示错误
      handleAndShowError(error)
      set({
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
        // 使用全局错误处理显示错误
        handleAndShowError(new Error(response.msg || '点赞失败'))
        set({
          operationLoading: { ...get().operationLoading, [`like_${momentId}`]: false }
        })
        return false
      }
    } catch (error) {
      // 使用全局错误处理显示错误
      handleAndShowError(error)
      set({
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
        // 使用全局错误处理显示错误
        handleAndShowError(new Error(response.msg || '取消点赞失败'))
        set({
          operationLoading: { ...get().operationLoading, [`unlike_${momentId}`]: false }
        })
        return false
      }
    } catch (error) {
      // 使用全局错误处理显示错误
      handleAndShowError(error)
      set({
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
        // 使用全局错误处理显示错误
        handleAndShowError(new Error(response.msg || '评论失败'))
        set({
          operationLoading: { ...get().operationLoading, [`comment_${momentId}`]: false }
        })
        return false
      }
    } catch (error) {
      // 使用全局错误处理显示错误
      handleAndShowError(error)
      set({
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
    }
    // 删除后的刷新逻辑由组件处理
  },

  // 导航到动态页面
  navigateToMomentPage: (momentType: MomentType, navigate:NavigateFunction, userInfo?:UserDetailInfo|null) => {
    try {
      let realMomentType = momentType;
      if(momentType === MomentType.USER) {
        if(!userInfo) {
          return
        }
        // 如果是当前用户，导航到我的动态页面
        const currentUser = useUserStore.getState().currentUser;
        if(userInfo.id === currentUser?.id) {
          realMomentType = MomentType.MINE
        }
      }
      
      // 根据动态类型导航到相应页面
      switch (realMomentType) {
        case MomentType.FRIEND:
          // 导航到朋友圈页面
          navigate('/main/moments/friend')
          break
        case MomentType.MINE:
          // 导航到我的动态页面
          navigate('/main/moments/mine')
          break
          
        case MomentType.USER: {
          if (!userInfo) {
            return
          }
          navigate(`/main/moments/user/${userInfo.id}`, { state: { userInfo: userInfo } })
          break
        }
          
        default:
          console.warn('未知的动态类型:', momentType)
          navigate('/main/moments')
      }
    } catch (error) {
      console.error('导航到动态页面失败:', error)
      // 发生错误时，默认导航到朋友圈页面
      navigate('/main/moments')
    }
  }
})) 