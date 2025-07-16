import http from '../lib/http'
import { compressImage, ImageCompressor } from '../utils/imageCompressor'

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
    let processedFile = file;
    
    // 如果是图片且大小超过1MB，进行压缩
    if (ImageCompressor.needsCompression(file)) {
      try {
        const compressionResult = await compressImage(file);
        processedFile = compressionResult.file;
        
        // 输出压缩信息到控制台
        console.log(`图片压缩完成: ${file.name}`);
        console.log(`原始大小: ${ImageCompressor.formatFileSize(compressionResult.originalSize)}`);
        console.log(`压缩后大小: ${ImageCompressor.formatFileSize(compressionResult.compressedSize)}`);
        console.log(`压缩率: ${(compressionResult.compressionRatio * 100).toFixed(1)}%`);
      } catch (error) {
        console.warn('图片压缩失败，使用原始文件上传:', error);
        // 压缩失败时仍然使用原文件上传
      }
    }
    
    const formData = new FormData()
    
    // 添加文件
    formData.append('file', processedFile)
    
    // 添加参数（需要以JSON字符串形式发送）
    const fileParamBlob = new Blob([JSON.stringify(param)], {
      type: 'application/json'
    })
    formData.append('fileParam', fileParamBlob)

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