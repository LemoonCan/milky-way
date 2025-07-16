import http from '../lib/http'
import type { 
  ApiResponse, 
  MomentDTO,
  Slices,
  PublishParam,
  CommentParam,
  MomentsQueryParams
} from '../types/api'

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