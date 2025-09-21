import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import styles from '../../css/auth/AuthFailurePage.module.css'

export const AuthFailurePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { forceLogout } = useAuthStore()
  const [countdown, setCountdown] = useState(10) // 10秒倒计时

  // 从URL参数获取错误消息
  const message = searchParams.get('message') || '认证失败'

  const handleComplete = useCallback(() => {
    console.log('[AuthFailurePage] 倒计时结束，开始清理token和跳转')
    
    // 1. 先清理token和用户状态
    forceLogout()
    
    // 2. 然后跳转到登录页面
    navigate('/login', { replace: true })
  }, [forceLogout, navigate])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [handleComplete])

  const handleReturnToLogin = () => {
    handleComplete()
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.content}>
          {/* 警告图标 */}
          <div className={styles.iconContainer}>
            <div className={styles.iconWrapper}>
              <AlertTriangle className={styles.icon} />
            </div>
          </div>
          
          {/* 文本区域 */}
          <div className={styles.textSection}>
            <p className={styles.message}>{message}</p>
          </div>
          
          {/* 倒计时信息 */}
          <div className={styles.countdownContainer}>
            <div className={styles.countdownDot} />
            <span className={styles.countdownText}>
              {countdown}秒后自动跳转到登录页面
            </span>
          </div>
          
          {/* 操作按钮 */}
          <div className={styles.buttonSection}>
            <button
              onClick={handleReturnToLogin}
              className={styles.primaryButton}
            >
              立即返回登录
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}