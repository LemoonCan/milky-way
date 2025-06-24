// 导出所有API服务
export { authService, default as AuthService } from './auth'
export { fileService, default as FileService } from './file'
export { userService, default as UserService } from './user'
export { friendService, default as FriendService } from './friend'

// 导出HTTP客户端和token管理器
export { default as http, tokenManager } from '../lib/http'

// 导出错误处理工具
export { 
  ErrorHandler, 
  ErrorType, 
  handleError, 
  getErrorMessage 
} from '../lib/error-handler'
export type { ErrorInfo } from '../lib/error-handler'

// 导出API类型
export type * from '../types/api' 