import React from "react";
import { WifiOff, RefreshCw, Wifi } from "lucide-react";
import { useConnectionManagerStore } from "@/store/connectionManager";
import { ConnectionStatus } from "@/store/connectionManager";
import styles from "../css/TitleBar.module.css";

interface TitleBarProps {
  title: string;
  className?: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title,
  className = "",
}) => {
  const {
    connectionStatus,
    isRetrying,
    isConnecting,
    isFailed,
    isConnected,
    getConnectionDisplayText,
    initializeApp,
  } = useConnectionManagerStore();

  // 处理网络重连
  const handleRetryConnection = async () => {
    if (isRetrying() || isConnecting()) {
      return;
    }

    // 直接调用连接管理器的初始化方法，它会自动处理用户信息获取和连接
    await initializeApp();
  };

  // 获取连接状态图标
  const getStatusIcon = () => {
    if (isConnected()) {
      return <Wifi className={styles.networkIcon} />;
    } else {
      return <WifiOff className={styles.networkIcon} />;
    }
  };

  // 获取连接状态样式
  const getStatusClassName = () => {
    let className = styles.networkStatus;

    if (isConnected()) {
      className += ` ${styles.networkConnected}`;
    } else if (isConnecting() || isRetrying()) {
      className += ` ${styles.networkConnecting}`;
    } else if (isFailed()) {
      className += ` ${styles.networkFailed}`;
    } else {
      className += ` ${styles.networkDisconnected}`;
    }

    return className;
  };

  // 是否显示重试按钮
  const showRetryButton = () => {
    return (
      (isFailed() || connectionStatus === ConnectionStatus.DISCONNECTED) &&
      !isRetrying() &&
      !isConnecting()
    );
  };

  return (
    <div className={`${styles.header} ${className}`}>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{title}</h1>
        {/* 网络状态指示器 */}
        <div className={getStatusClassName()}>
          <div
            className={styles.networkIndicator}
            onClick={showRetryButton() ? handleRetryConnection : undefined}
            style={{ cursor: showRetryButton() ? "pointer" : "default" }}
          >
            {getStatusIcon()}
            <span className={styles.networkText}>
              {getConnectionDisplayText()}
            </span>
            {(isConnecting() || isRetrying()) && (
              <RefreshCw className={`${styles.retryIcon} ${styles.spinning}`} />
            )}
            {showRetryButton() && <RefreshCw className={styles.retryIcon} />}
          </div>
        </div>
      </div>
    </div>
  );
};
