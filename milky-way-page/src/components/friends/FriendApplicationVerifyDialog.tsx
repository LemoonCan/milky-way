import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Avatar } from '../Avatar'
import { useFriendStore } from '../../store/friend'
import type { FriendApplication } from '../../services/friend'
import styles from '../../css/friends/FriendApplicationVerifyDialog.module.css'

interface FriendApplicationVerifyDialogProps {
  open: boolean
  application: FriendApplication | null
  onClose: () => void
}

export const FriendApplicationVerifyDialog: React.FC<FriendApplicationVerifyDialogProps> = ({ 
  open, 
  application, 
  onClose 
}) => {
  const [remark, setRemark] = useState('')
  const [permission, setPermission] = useState<'ALL' | 'CHAT'>('ALL')
  
  const { handleFriendApplication, isLoading } = useFriendStore()

  const handleClose = () => {
    setRemark('')
    setPermission('ALL')
    onClose()
  }

  const handleAccept = async () => {
    if (!application) return

    const extraInfo = {
      remark: remark.trim() || undefined,
      permission
    }

    const success = await handleFriendApplication(application.id, 'accept', extraInfo)
    if (success) {
      handleClose()
    }
  }

  const handleReject = async () => {
    if (!application) return

    const extraInfo = {
      remark: remark.trim() || undefined,
      permission
    }

    const success = await handleFriendApplication(application.id, 'reject', extraInfo)
    if (success) {
      handleClose()
    }
  }

  if (!open || !application) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        {/* 头部 */}
        <div className={styles.header}>
          <h3 className={styles.title}>好友申请</h3>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>


        {/* 内容 */}
        <div className={styles.content}>
          {/* 用户信息 */}
          <div className={styles.userCard}>
            <Avatar
              avatarUrl={application.fromUser.avatar}
              userId={application.fromUser.id}
              size={60}
            />
            <div className={styles.userInfo}>
              <div className={styles.nickName}>{application.fromUser.nickName}</div>
              <div className={styles.userId}>账号：{application.fromUser.openId}</div>
            </div>
          </div>

          {/* 申请消息 */}
          <div className={styles.messageSection}>
            <label className={styles.messageLabel}>申请消息</label>
            <div className={styles.messageContent}>
              {application.applyMsg || '我是柠檬糖...'}
            </div>
            <div className={styles.messageCount}>
              {(application.applyMsg || '我是柠檬糖...').length}/100
            </div>
          </div>

          {/* 备注 */}
          <div className={styles.remarkSection}>
            <label className={styles.remarkLabel}>备注</label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="给好友添加备注..."
              className={styles.remarkInput}
              maxLength={50}
            />
            <div className={styles.remarkCount}>
              {remark.length}/50
            </div>
          </div>

          {/* 权限设置 */}
          <div className={styles.permissionSection}>
            <label className={styles.permissionLabel}>权限设置</label>
            <div className={styles.permissionOptions}>
              <label className={styles.permissionOption}>
                <input
                  type="radio"
                  name="permission"
                  value="ALL"
                  checked={permission === 'ALL'}
                  onChange={(e) => setPermission(e.target.value as 'ALL' | 'CHAT')}
                />
                <span className={styles.permissionText}>
                  <strong>全部权限</strong>
                  <small>可查看动态等</small>
                </span>
              </label>
              <label className={styles.permissionOption}>
                <input
                  type="radio"
                  name="permission"
                  value="CHAT"
                  checked={permission === 'CHAT'}
                  onChange={(e) => setPermission(e.target.value as 'ALL' | 'CHAT')}
                />
                <span className={styles.permissionText}>
                  <strong>仅聊天</strong>
                  <small>只能聊天，不能查看其他信息</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className={styles.footer}>
          <button 
            onClick={handleReject} 
            className={styles.rejectButton}
            disabled={isLoading}
          >
            拒绝
          </button>
          <button 
            onClick={handleAccept} 
            className={styles.acceptButton}
            disabled={isLoading}
          >
            接受
          </button>
        </div>
      </div>
    </div>
  )
} 