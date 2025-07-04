import React from 'react'
import { WifiOff, RefreshCw, Wifi } from 'lucide-react'
import { useChatStore } from '@/store/chat'
import { ConnectionStatus } from '@/utils/websocket'
import styles from '../css/TitleBar.module.css'

interface TitleBarProps {
  title: string
  className?: string
}

export const TitleBar: React.FC<TitleBarProps> = ({ 
  title, 
  className = '' 
}) => {
  const { 
    connectionStatus,
    resetConnection,
    initializeChatService,
    getConnectionDisplayText,
    isConnected,
    isConnecting,
    isRetrying,
    isFailed
  } = useChatStore()

  // 处理网络重连
  const handleRetryConnection = async () => {
    console.log('[TitleBar] handleRetryConnection 被调用')
    console.log('[TitleBar] 当前状态:', {
      isRetrying: isRetrying(),
      isConnecting: isConnecting(),
      connectionStatus,
      isFailed: isFailed()
    })
    
    if (isRetrying() || isConnecting()) {
      console.log('[TitleBar] 连接正在进行中，跳过重试')
      return
    }
    
    try {
      console.log('[TitleBar] 开始重新连接...')
      
      // 简化逻辑：只进行一次WebSocket重连尝试
      if (isFailed() || connectionStatus === ConnectionStatus.DISCONNECTED) {
        console.log('[TitleBar] 调用 initializeChatService')
        await initializeChatService()
        console.log('[TitleBar] initializeChatService 完成')
      } else {
        console.log('[TitleBar] 调用 resetConnection')
        await resetConnection()
        console.log('[TitleBar] resetConnection 完成')
      }
    } catch (error) {
      console.error('[TitleBar] 重新连接失败:', error)
    }
  }

  // 获取连接状态图标
  const getStatusIcon = () => {
    if (isConnected()) {
      return <Wifi className={styles.networkIcon} />
    } else {
      return <WifiOff className={styles.networkIcon} />
    }
  }

  // 获取连接状态样式
  const getStatusClassName = () => {
    let className = styles.networkStatus
    
    if (isConnected()) {
      className += ` ${styles.networkConnected}`
    } else if (isConnecting() || isRetrying()) {
      className += ` ${styles.networkConnecting}`
    } else if (isFailed()) {
      className += ` ${styles.networkFailed}`
    } else {
      className += ` ${styles.networkDisconnected}`
    }
    
    return className
  }

  // 是否显示重试按钮
  const showRetryButton = () => {
    return (isFailed() || connectionStatus === ConnectionStatus.DISCONNECTED) && !isRetrying() && !isConnecting()
  }

  return (
    <div className={`${styles.header} ${className}`}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>
          {title}
        </h1>
        {/* 网络状态指示器 */}
        <div className={getStatusClassName()}>
          <div 
            className={styles.networkIndicator}
            onClick={showRetryButton() ? handleRetryConnection : undefined}
            style={{ cursor: showRetryButton() ? 'pointer' : 'default' }}
          >
            {getStatusIcon()}
            <span className={styles.networkText}>
              {getConnectionDisplayText()}
            </span>
            {(isConnecting() || isRetrying()) && (
              <RefreshCw className={`${styles.retryIcon} ${styles.spinning}`} />
            )}
            {showRetryButton() && (
              <RefreshCw className={styles.retryIcon} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 