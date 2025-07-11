/**
 * 环境配置工具类
 */
export class EnvConfig {
  /** 当前环境 */
  static readonly NODE_ENV = import.meta.env.VITE_NODE_ENV || 'development'
  
  /** 应用名称 */
  static readonly APP_NAME = import.meta.env.VITE_APP_NAME || 'MilkyWay'
  
  /** 应用版本 */
  static readonly APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'
  
  /** API基础URL */
  static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  
  /** WebSocket URL */
  static readonly WS_URL = import.meta.env.VITE_WS_URL
  
  /** WebSocket主机 */
  static readonly WS_HOST = (() => {
    const url = new URL(EnvConfig.WS_URL)
    return url.host
  })()
  
  /** 是否启用HTTPS */
  static readonly HTTPS_ENABLED = import.meta.env.VITE_HTTPS_ENABLED === 'true'
  
  /** 服务器主机地址 */
  static readonly SERVER_HOST = import.meta.env.VITE_SERVER_HOST || '0.0.0.0'
  
  /** 服务器端口 */
  static readonly SERVER_PORT = parseInt(import.meta.env.VITE_SERVER_PORT) || 5173
  
  /** 是否为开发环境 */
  static readonly IS_DEVELOPMENT = this.NODE_ENV === 'development'
  
  /** 是否为生产环境 */
  static readonly IS_PRODUCTION = this.NODE_ENV === 'production'
  
  /**
   * 获取环境信息
   */
  static getEnvInfo() {
    return {
      nodeEnv: this.NODE_ENV,
      appName: this.APP_NAME,
      appVersion: this.APP_VERSION,
      apiBaseUrl: this.API_BASE_URL,
      wsUrl: this.WS_URL,
      wsHost: this.WS_HOST,
      httpsEnabled: this.HTTPS_ENABLED,
      serverHost: this.SERVER_HOST,
      serverPort: this.SERVER_PORT,
      isDevelopment: this.IS_DEVELOPMENT,
      isProduction: this.IS_PRODUCTION,
    }
  }
  
  /**
   * 打印环境信息（仅开发环境）
   */
  static printEnvInfo() {
    if (this.IS_DEVELOPMENT) {
      console.log('🌟 环境配置信息:', this.getEnvInfo())
    }
  }
}

// 开发环境自动打印配置信息
if (EnvConfig.IS_DEVELOPMENT) {
  EnvConfig.printEnvInfo()
}

export default EnvConfig 