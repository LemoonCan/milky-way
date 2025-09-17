import React, { useState, useRef, useEffect } from 'react'
import { Avatar } from '../Avatar'
import { Trash2, ChevronLeft } from 'lucide-react'
import { EmojiText } from '../EmojiText'
import { ConfirmDialog } from '../ui/confirm-dialog'
import { chatService } from '../../services/chat'
import { useChatStore } from '@/store/chat'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { ChatInfoDTO } from '../../services/chat'
import styles from '../../css/chats/ChatHeader.module.css'

interface ChatHeaderProps {
  chat: ChatInfoDTO
  onBack?: () => void
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onBack
}) => {
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [showDeleteChatDialog, setShowDeleteChatDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const moreActionsRef = useRef<HTMLDivElement>(null)
  const { removeChat } = useChatStore()
  const isMobile = useIsMobile()

  // 处理更多操作按钮点击
  const handleMoreActionsClick = () => {
    setShowMoreActions(!showMoreActions)
  }

  // 处理解散群聊
  const handleDeleteChat = () => {
    setShowMoreActions(false)
    setShowDeleteChatDialog(true)
  }

  // 确认解散群聊
  const confirmDeleteChat = async () => {
    setIsDeleting(true)
    try {
      await chatService.deleteChat(chat.id)
      // 解散成功后，从聊天列表中移除该群聊
      removeChat(chat.id)
      setShowDeleteChatDialog(false)
      console.log('群聊解散成功')
    } catch (error) {
      console.error('解散群聊失败:', error)
      // 这里可以添加错误提示
    } finally {
      setIsDeleting(false)
    }
  }

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setShowMoreActions(false)
      }
    }

    if (showMoreActions) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMoreActions])

  return (
    <div className={styles.chatHeader}>
      <div className={styles.chatHeaderUser}>
        {/* 移动端返回按钮 */}
        {isMobile && onBack && (
          <button className={styles.backButton} onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
        )}
        
        <Avatar 
          size={40}
          userId={chat.chatType === 'SINGLE' ? chat.friendId : chat.id}
          avatarUrl={chat.avatar}
          style={{
            boxShadow: 'var(--milky-shadow)'
          }}
        />
        <div className={styles.chatHeaderInfo}>
          <h2 className={styles.chatHeaderName}>
            <EmojiText text={chat.title} size="1em" />
            {chat.chatType === 'SINGLE' && (
              <span className={styles.chatHeaderStatus}>
                ({chat.online ? '在线' : '离线'})
              </span>
            )}
          </h2>
        </div>
      </div>
      
      <div className={styles.chatHeaderActions} ref={moreActionsRef}>
        <div 
          className={styles.chatHeaderBtn}
          onClick={handleMoreActionsClick}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--milky-text-light)" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="19" cy="12" r="1"/>
            <circle cx="5" cy="12" r="1"/>
          </svg>
        </div>
        
        {/* 更多操作下拉菜单 */}
        {showMoreActions && chat?.chatType === 'GROUP' && (
          <div className={styles.moreActionsMenu}>
            <button
              onClick={handleDeleteChat}
              className={`${styles.moreActionItem} ${styles.dangerAction}`}
            >
              <Trash2 size={16} />
              解散群聊
            </button>
          </div>
        )}
      </div>

      {/* 解散群聊确认弹框 */}
      <ConfirmDialog
        isOpen={showDeleteChatDialog}
        title="解散群聊"
        message={`确定要解散群聊 "${chat?.title}" 吗？\n解散后所有成员将无法再在此群聊中发送消息。`}
        confirmText={isDeleting ? "解散中..." : "解散群聊"}
        cancelText="取消"
        onConfirm={confirmDeleteChat}
        onCancel={() => setShowDeleteChatDialog(false)}
      />
    </div>
  )
}
