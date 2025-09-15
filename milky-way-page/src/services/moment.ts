import http from '../lib/http'
import type { ApiResponse, Slices } from '../types/api'
import type { SimpleUserDTO } from './user'

// 朋友圈动态内容类型
export enum MomentContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  TEXT_IMAGE = 'TEXT_IMAGE'
}

// 朋友圈动态描述DTO
export interface MomentDescriptionDTO {
  id: string
  contentType: MomentContentType
  text?: string
  medias?: string[]
}

// 评论DTO - 根据实际后端返回数据结构调整
export interface CommentDTO {
  id: number
  momentId?: string  // 添加 momentId 字段（用于通知）
  parentCommentId?: number | null
  user: SimpleUserDTO
  content: string
  createTime: string | null  // 允许null值
  replyUser?: SimpleUserDTO
  replies?: CommentDTO[]
}

// 朋友圈动态DTO - 根据实际后端返回数据结构调整
export interface MomentDTO {
  id: string
  user: SimpleUserDTO
  contentType?: MomentContentType
  text?: string
  medias?: string[]
  location?: string
  likeCounts?: number // 可选：不再在前端使用显示
  commentCounts?: number // 可选：不再在前端使用显示
  createTime: string | null  // 修正字段名，匹配后端返回数据
  likeUsers?: SimpleUserDTO[]
  comments?: CommentDTO[]
}

// 发布动态参数 - 根据后端PublishParam调整
export interface PublishParam {
  text?: string
  contentType: MomentContentType
  medias?: string[]
  location?: string
  publishUserId?: string
}

// 评论参数
export interface CommentParam {
  momentId: string
  content: string
  parentCommentId?: string
  commentUserId?: string
}

// 点赞DTO - 用于通知
export interface LikeDTO {
  momentDescription: MomentDescriptionDTO
  user: SimpleUserDTO
  createTime: string
}

// 取消点赞DTO - 用于通知
export interface UnlikeDTO {
  momentId: string
  userId: string
  publishUserId: string
}

// 带动态信息的评论DTO - 用于通知
export interface CommentWithMomentDTO {
  id: number
  momentDescription: MomentDescriptionDTO
  parentCommentId?: number | null
  user: SimpleUserDTO
  content: string
  createTime: string
  replyUser?: SimpleUserDTO
}

// 朋友圈动态查询参数
export interface MomentsQueryParams {
  lastId?: string
  pageSize: number
}

class MomentService {
  /**
   * 发布动态
   */
  async publish(data: PublishParam): Promise<ApiResponse<string>> {
    const response = await http.post<ApiResponse<string>>('/moments', data)
    return response.data
  }

  /**
   * 删除动态
   */
  async deleteMoment(momentId: string): Promise<ApiResponse<void>> {
    const response = await http.delete<ApiResponse<void>>(`/moments/${momentId}`)
    return response.data
  }

  /**
   * 点赞动态
   */
  async likeMoment(momentId: string): Promise<ApiResponse<string>> {
    const response = await http.patch<ApiResponse<string>>(`/moments/like?momentId=${momentId}`)
    return response.data
  }

  /**
   * 取消点赞
   */
  async unlikeMoment(momentId: string): Promise<ApiResponse<void>> {
    const response = await http.patch<ApiResponse<void>>(`/moments/unlike?momentId=${momentId}`)
    return response.data
  }

  /**
   * 评论动态
   */
  async commentMoment(data: CommentParam): Promise<ApiResponse<number>> {
    const response = await http.patch<ApiResponse<number>>('/moments/comment', data)
    return response.data
  }

  /**
   * 获取好友动态列表
   */
  async getFriendMoments(params: MomentsQueryParams): Promise<ApiResponse<Slices<MomentDTO>>> {
    const response = await http.get<ApiResponse<Slices<MomentDTO>>>('/moments/myFriends', { params })
    return response.data
  }

  /**
   * 获取我的动态列表
   */
  async getMyMoments(params: MomentsQueryParams): Promise<ApiResponse<Slices<MomentDTO>>> {
    const response = await http.get<ApiResponse<Slices<MomentDTO>>>('/moments/my', { params })
    return response.data
  }

  /**
   * 获取指定用户的动态列表
   */
  async getUserMoments(userId: string, params: MomentsQueryParams): Promise<ApiResponse<Slices<MomentDTO>>> {
    const response = await http.get<ApiResponse<Slices<MomentDTO>>>('/moments/personal', { 
      params: { userId, ...params } 
    })
    return response.data
  }

  /**
   * 获取单个动态详情
   */
  async getMoment(momentId: string): Promise<MomentDTO> {
    const response = await http.get<ApiResponse<MomentDTO>>(`/moments/${momentId}`)
    
    if (response.data.success !== false && response.data.data) {
      return response.data.data
    } else {
      throw new Error(response.data.msg || '获取动态详情失败')
    }
  }
}

export const momentService = new MomentService()
export default momentService 