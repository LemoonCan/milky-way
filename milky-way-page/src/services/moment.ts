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
   * 获取朋友圈动态列表
   */
  async getFriendMoments(params: MomentsQueryParams): Promise<ApiResponse<Slices<MomentDTO>>> {
    const response = await http.get<ApiResponse<Slices<MomentDTO>>>('/moments', { params })
    return response.data
  }
}

export const momentService = new MomentService()
export default momentService 