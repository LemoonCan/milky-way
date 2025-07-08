import React, { useState } from 'react'
import { Avatar } from '../Avatar'
import { MessageCircle, UserCheck, Phone, Video } from 'lucide-react'
import { FriendApplicationVerifyDialog } from './FriendApplicationVerifyDialog'
import type { FriendApplication } from '../../types/api'
import styles from '../../css/friends/FriendApplicationDetail.module.css'

interface FriendApplicationDetailProps {
  application: FriendApplication
}

// 根据申请渠道获取中文描述
const getApplyChannelText = (applyChannel?: string): string => {
  switch (applyChannel) {
    case 'ACCOUNT_SEARCH':
      return '通过搜索账号添加'
    case 'PHONE_SEARCH':
      return '通过搜索手机号添加'
    case 'QR_CODE':
      return '通过扫描二维码添加'
    case 'NEARBY':
      return '通过附近的人添加'
    case 'GROUP_CHAT':
      return '通过群聊添加'
    case 'FRIEND_RECOMMEND':
      return '通过朋友推荐添加'
    default:
      return '未知' // 默认值
  }
}

export const FriendApplicationDetail: React.FC<FriendApplicationDetailProps> = ({ application }) => {
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)

  const handleVerify = () => {
    setShowVerifyDialog(true)
  }

  const handleCloseVerifyDialog = () => {
    setShowVerifyDialog(false)
  }

  const handleSendMessage = () => {
    // 这里可以跳转到聊天界面
    console.log('Send message to:', application.fromUser.nickName)
  }

  const handleVoiceCall = () => {
    console.log('Voice call to:', application.fromUser.nickName)
  }

  const handleVideoCall = () => {
    console.log('Video call to:', application.fromUser.nickName)
  }

  return (
    <>
      <div className={styles.applicationDetail}>
        {/* 顶部基本信息 */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            <Avatar
              avatarUrl={application.fromUser.avatar}
              userId={application.fromUser.id}
              size={100}
            />
          </div>
          
          <div className={styles.basicInfo}>
            <h1 className={styles.displayName}>
              {application.fromUser.nickName}
            </h1>
            <div className={styles.userId}>账号：{application.fromUser.openId}</div>
            <div className={styles.applyTime}>
              申请时间：{application.createTime ? new Date(application.createTime).toLocaleString('zh-CN') : '未知'}
            </div>
          </div>
        </div>

        {/* 申请消息区域 */}
        {application.applyMsg && (
          <div className={styles.messageSection}>
            <div className={styles.sectionTitle}>申请消息</div>
            <div className={styles.messageContent}>
              {application.applyMsg}
            </div>
          </div>
        )}

        {/* 来源信息 */}
        <div className={styles.sourceSection}>
          <div className={styles.sectionTitle}>来源</div>
          <div className={styles.sourceContent}>
            {getApplyChannelText(application.applyChannel)}
          </div>
        </div>

        {/* 操作按钮 - 只在待验证状态显示 */}
        {application.status === 'APPLYING' && (
          <div className={styles.actionButtons}>
            <button
              onClick={handleVerify}
              className={styles.verifyButton}
            >
              <UserCheck size={20} />
              <span>前往验证</span>
            </button>
          </div>
        )}

        {/* 已通过状态下的操作 */}
        {application.status === 'ACCEPTED' && (
          <div className={styles.primaryActions}>
            <button
              onClick={handleSendMessage}
              className={styles.actionButton}
            >
              <MessageCircle size={24} />
              <span>发消息</span>
            </button>
            
            <button
              onClick={handleVoiceCall}
              className={styles.actionButton}
            >
              <Phone size={24} />
              <span>语音通话</span>
            </button>
            
            <button
              onClick={handleVideoCall}
              className={styles.actionButton}
            >
              <Video size={24} />
              <span>视频通话</span>
            </button>
          </div>
        )}
      </div>

      {/* 验证弹窗 */}
      <FriendApplicationVerifyDialog
        open={showVerifyDialog}
        application={application}
        onClose={handleCloseVerifyDialog}
      />
    </>
  )
} 