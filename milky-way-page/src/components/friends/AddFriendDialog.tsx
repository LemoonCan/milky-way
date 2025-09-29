import React, { useState } from 'react'
import { Search, X, UserPlus } from 'lucide-react'
import { Avatar } from '../Avatar'
import { useFriendStore } from '../../store/friend'
import { useUserStore } from '../../store/user'
import type { User } from '../../services/user'
import styles from '../../css/friends/AddFriendDialog.module.css'

interface AddFriendDialogProps {
  open: boolean
  onClose: () => void
}

export const AddFriendDialog: React.FC<AddFriendDialogProps> = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<User | null>(null)
  const [message, setMessage] = useState('')
  const [remark, setRemark] = useState('')
  const [permission, setPermission] = useState<'ALL' | 'CHAT'>('ALL')
  const [step, setStep] = useState<'search' | 'confirm'>('search')
  const [searchError, setSearchError] = useState('')

  
  const { searchUserByOpenId, addFriend, isLoading } = useFriendStore()
  const { currentUser } = useUserStore()

  const handleClose = () => {
    setSearchQuery('')
    setSearchResult(null)
    setMessage('')
    setRemark('')
    setPermission('ALL')
    setStep('search')
    onClose()
    setSearchError('')
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    // 验证是否为用户本人
    if (currentUser?.openId === searchQuery.trim()) {
      setSearchError('你自己的账号🤒')
      setSearchResult(null)
      return
    }

    try {
      // 默认使用 openId 搜索
      const user = await searchUserByOpenId(searchQuery.trim())

      if (user) {
        setSearchResult(user)
        setStep('confirm')
        // 设置默认申请消息
        if (currentUser?.nickName) {
          setMessage(`我是${currentUser.nickName}...`)
        }
      } else {
        setSearchError('未找到该用户')
        setSearchResult(null)
      }
    } catch{
      setSearchError('未知错误')
      setSearchResult(null)
    }
  }

  const handleAddFriend = async () => {
    if (!searchResult || !message.trim()) return

    try {
      const extraInfo = {
        remark: remark.trim() || undefined,
        permission
      }
      await addFriend(searchResult.id, message.trim(), 'ACCOUNT_SEARCH', extraInfo)
      handleClose()
    } catch (error) {
      console.error('Add friend error:', error)
    }
  }

  const handleBack = () => {
    setStep('search')
    setSearchResult(null)
    setMessage('')
    setSearchError('')
  }

  if (!open) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        {/* 头部 */}
        <div className={styles.header}>
          <h3 className={styles.title}>
            {step === 'search' ? '添加好友' : '好友申请'}
          </h3>
          <button onClick={handleClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className={styles.content}>
          {step === 'search' ? (
            <>
              {/* 搜索框 */}
              <div className={styles.searchContainer}>
                <div className={styles.searchInputWrapper}>
                  <input
                    type="text"
                    placeholder="请输入账号"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (searchError) setSearchError('')
                    }}
                    className={styles.searchInput}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  {/* 搜索错误提示 */}
                  {searchError && (
                    <div className={styles.searchError}>
                      {searchError}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  className={styles.searchButton}
                  disabled={!searchQuery.trim() || isLoading}
                >
                  <Search size={18} />
                  搜索
                </button>
              </div>

              {/* 搜索结果 */}
              {searchResult && (
                <div className={styles.searchResult}>
                  <div className={styles.userCard}>
                    <Avatar
                      avatarUrl={searchResult.avatar}
                      userId={searchResult.id}
                      size={60}
                    />
                    <div className={styles.userInfo}>
                      <div className={styles.nickName}>{searchResult.nickName}</div>
                      {searchResult.individualSignature && (
                        <div className={styles.signature}>{searchResult.individualSignature}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* 确认添加好友 */}
              {searchResult && (
                <div className={styles.confirmSection}>
                  <div className={styles.userCard}>
                    <Avatar
                      avatarUrl={searchResult.avatar}
                      userId={searchResult.id}
                      size={60}
                    />
                    <div className={styles.userInfo}>
                      <div className={styles.nickName}>{searchResult.nickName}</div>
                      {searchResult.individualSignature && (
                        <div className={styles.signature}>{searchResult.individualSignature}</div>
                      )}
                    </div>
                  </div>

                  {/* 申请消息 */}
                  <div className={styles.messageSection}>
                    <label className={styles.messageLabel}>申请消息</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="我是..."
                      className={styles.messageInput}
                      rows={3}
                      maxLength={100}
                      required
                    />
                    <div className={styles.messageCount}>
                      {message.length}/100
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
              )}
            </>
          )}
        </div>

        {/* 底部按钮 */}
        <div className={styles.footer}>
          {step === 'search' ? (
            <button onClick={handleClose} className={styles.cancelButton}>
              取消
            </button>
          ) : (
            <>
              <button onClick={handleBack} className={styles.backButton}>
                返回
              </button>
              <button
                onClick={handleAddFriend}
                className={styles.confirmButton}
                disabled={isLoading || !message.trim()}
              >
                <UserPlus size={18} />
                发送申请
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 