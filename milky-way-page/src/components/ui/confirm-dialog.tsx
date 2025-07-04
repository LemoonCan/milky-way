import React from 'react'
import { createPortal } from 'react-dom'
import { Button } from './button'
import { AlertTriangle } from 'lucide-react'
import styles from './confirm-dialog.module.css'

interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  previewContent?: React.ReactNode
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = '确认操作',
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
  previewContent
}) => {
  if (!isOpen) return null

  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <AlertTriangle className={styles.icon} />
          </div>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        <div className={styles.content}>
          {previewContent && (
            <div className={styles.previewContent}>
              {previewContent}
            </div>
          )}
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          <Button
            variant="outline"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={styles.confirmButton}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
} 