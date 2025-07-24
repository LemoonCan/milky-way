import React from 'react'
import { WifiOff, RefreshCw, Wifi } from 'lucide-react'
import { useConnectionManagerStore, connectionManager } from '@/store/connectionManager'
import { ConnectionStatus } from '@/services/websocket'
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
    connectionStatus
  } = useConnectionManagerStore()

  // 处理网络重连
  const handleRetryConnection = async () => {
    console.log('[TitleBar] handleRetryConnection 被调用')
    console.log('[TitleBar] 当前状态:', {
      isRetrying: connectionManager.isRetrying(),
      isConnecting: connectionManager.isConnecting(),
      connectionStatus,
      isFailed: connectionManager.isFailed()
    })
    
    if (connectionManager.isRetrying() || connectionManager.isConnecting()) {
      console.log('[TitleBar] 连接正在进行中，跳过重试')
      return
    }
    
    try {
      console.log('[TitleBar] 开始重新连接...')
      
      // 简化逻辑：只进行一次WebSocket重连尝试
      if (connectionManager.isFailed() || connectionStatus === ConnectionStatus.DISCONNECTED) {
        console.log('[TitleBar] 调用 connectionManager.resetConnection')
        await connectionManager.resetConnection()
        console.log('[TitleBar] connectionManager.resetConnection 完成')
      } else {
        console.log('[TitleBar] 调用 connectionManager.resetConnection')
        await connectionManager.resetConnection()
        console.log('[TitleBar] connectionManager.resetConnection 完成')
      }
    } catch (error) {
      console.error('[TitleBar] 重新连接失败:', error)
    }
  }

  // 获取连接状态图标
  const getStatusIcon = () => {
    if (connectionManager.isConnected()) {
      return <Wifi className={styles.networkIcon} />
    } else {
      return <WifiOff className={styles.networkIcon} />
    }
  }

  // 获取连接状态样式
  const getStatusClassName = () => {
    let className = styles.networkStatus
    
    if (connectionManager.isConnected()) {
      className += ` ${styles.networkConnected}`
    } else if (connectionManager.isConnecting() || connectionManager.isRetrying()) {
      className += ` ${styles.networkConnecting}`
    } else if (connectionManager.isFailed()) {
      className += ` ${styles.networkFailed}`
    } else {
      className += ` ${styles.networkDisconnected}`
    }
    
    return className
  }

  // 是否显示重试按钮
  const showRetryButton = () => {
    return (connectionManager.isFailed() || connectionStatus === ConnectionStatus.DISCONNECTED) && !connectionManager.isRetrying() && !connectionManager.isConnecting()
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
              {connectionManager.getConnectionDisplayText()}
            </span>
            {(connectionManager.isConnecting() || connectionManager.isRetrying()) && (
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