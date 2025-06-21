import http from '../lib/http'

// 文件权限枚举
export enum FilePermission {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE'
}

// 文件上传参数
export interface FileUploadParam {
  permission: FilePermission
}

// 文件信息响应
export interface FileInfoDTO {
  fileId: string
  fileAccessUrl: string
}

// API 响应格式
export interface ApiResponse<T> {
  success: boolean
  msg?: string
  data?: T
}

class FileService {
  /**
   * 上传文件
   * @param file 要上传的文件
   * @param param 上传参数
   * @returns 文件信息
   */
  async uploadFile(file: File, param: FileUploadParam): Promise<FileInfoDTO> {
    const formData = new FormData()
    
    // 添加文件
    formData.append('file', file)
    
    // 添加参数（需要以JSON字符串形式发送）
    const fileParamBlob = new Blob([JSON.stringify(param)], {
      type: 'application/json'
    })
    formData.append('fileParam', fileParamBlob)

    try {
      const response = await http.post<ApiResponse<FileInfoDTO>>('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.msg || '文件上传失败')
      }
    } catch (error) {
      // 对于HTTP状态码错误，只显示通用错误信息
      const httpError = error as { response?: { status: number } }
      if (httpError?.response?.status && httpError.response.status !== 200) {
        const status = httpError.response.status
        if (status==403){
            throw new Error('访问受限')
        }else if(status === 413) {
          throw new Error('文件过大，请选择较小的文件')
        } else if (status >= 400 && status < 500) {
          throw new Error('文件上传失败，请检查文件格式')
        } else if (status >= 500) {
          throw new Error('服务器错误，请稍后重试')
        } else {
          throw new Error('文件上传失败')
        }
      }
      
      // 对于其他错误，显示原始错误信息或通用信息
      const errorWithMessage = error as { message?: string }
      throw new Error(errorWithMessage?.message || '文件上传失败')
    }
  }

  /**
   * 上传头像（公开权限）
   * @param file 头像文件
   * @returns 文件信息
   */
  async uploadAvatar(file: File): Promise<FileInfoDTO> {
    return this.uploadFile(file, { permission: FilePermission.PUBLIC })
  }
}

export const fileService = new FileService()
export default fileService 