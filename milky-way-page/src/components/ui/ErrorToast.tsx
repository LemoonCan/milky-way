import React, { useEffect } from 'react'
import styles from './ErrorToast.module.css'

interface ErrorToastProps {
  message: string | null
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
  style?: React.CSSProperties
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  onClose,
  autoClose = false,
  autoCloseDelay = 3000,
  position = 'top-right',
  style
}) => {
  // 自动关闭功能
  useEffect(() => {
    if (message && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)
      
      return () => clearTimeout(timer)
    }
  }, [message, autoClose, autoCloseDelay, onClose])

  // 如果没有错误消息，不渲染组件
  if (!message) {
    return null
  }

  return (
    <div 
      className={`${styles.errorToast} ${styles[position]}`}
      style={style}
    >
      <span className={styles.errorMessage}>{message}</span>
      <button 
        onClick={onClose} 
        className={styles.errorCloseBtn}
        aria-label="关闭错误提示"
      >
        ×
      </button>
    </div>
  )
} 