import { create } from 'zustand'
import { MessageNotifyType } from '../types/api'
import type { 
  NotificationItem, 
  NotificationStats, 
  MessageNotifyDTO, 
  ChatInfoDTO,
  MomentDTO,
  LikeDTO,
  CommentWithMomentDTO
} from '../types/api'
import type { FriendApplicationDTO } from '../services/friend'

interface NotificationStore {
  // 状态
  notifications: NotificationItem[]
  stats: NotificationStats
  isLoading: boolean
  error: string | null
  
  // 通知面板状态
  isNotificationPanelOpen: boolean
  
  // 方法
  addNotification: (notification: MessageNotifyDTO<unknown>) => void
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  removeNotification: (notificationId: string) => void
  clearAll: () => void
  toggleNotificationPanel: () => void
  closeNotificationPanel: () => void
  
  // 通知处理器
  handleFriendApplicationNotification: (content: FriendApplicationDTO) => void
  handleGroupChatCreatedNotification: (content: ChatInfoDTO) => void
  handleGroupChatDeletedNotification: (chatId: string) => void
  handleMomentPublishedNotification: (content: MomentDTO) => void
  handleMomentDeletedNotification: (momentId: string) => void
  handleMomentLikedNotification: (content: LikeDTO) => void
  handleMomentLikeCancelledNotification: (likeId: string) => void
  handleMomentCommentedNotification: (content: CommentWithMomentDTO) => void
  handleCommentDeletedNotification: (commentId: string) => void
  
  // 工具方法
  updateStats: () => void
  clearError: () => void
  
  // 新增：获取朋友圈相关通知（点赞、评论）
  getMomentNotifications: () => NotificationItem[]
  getMomentStats: () => { total: number; unread: number; likeCount: number; commentCount: number }
}

// 生成通知ID的工具函数
const generateNotificationId = (type: MessageNotifyType): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${type}_${timestamp}_${random}`
}

// 格式化通知内容的工具函数
const formatNotificationContent = (
  type: MessageNotifyType, 
  content: unknown
): { title: string; message: string; avatar?: string } => {
  switch (type) {
    case MessageNotifyType.FRIEND_APPLY: {
      const data = content as FriendApplicationDTO
      return {
        title: '好友申请',
        message: `${data.fromUser.nickName} 请求添加您为好友`,
        avatar: data.fromUser.avatar
      }
    }
    case MessageNotifyType.CHAT_CREATE: {
      const data = content as ChatInfoDTO
      return {
        title: '群聊创建',
        message: `您被邀请加入群聊 "${data.title}"`,
        avatar: data.avatar
      }
    }
    case MessageNotifyType.CHAT_DELETE: {
      return {
        title: '群聊解散',
        message: '您所在的群聊已被解散'
      }
    }
    case MessageNotifyType.MOMENT_CREATE: {
      const data = content as MomentDTO
      return {
        title: '新动态',
        message: `${data.user.nickName} 发布了新动态`,
        avatar: data.user.avatar
      }
    }
    case MessageNotifyType.MOMENT_DELETE: {
      return {
        title: '动态删除',
        message: '有朋友删除了动态'
      }
    }
    case MessageNotifyType.LIKE: {
      const data = content as LikeDTO
      return {
        title: '点赞提醒',
        message: `${data.user.nickName} 赞了您的动态`,
        avatar: data.user.avatar
      }
    }
    case MessageNotifyType.UNLIKE: {
      return {
        title: '取消点赞',
        message: '有朋友取消了点赞'
      }
    }
    case MessageNotifyType.COMMENT: {
      const data = content as CommentWithMomentDTO
      return {
        title: '评论提醒',
        message: `${data.user.nickName} 评论了您的动态`,
        avatar: data.user.avatar
      }
    }
    case MessageNotifyType.COMMENT_DELETE: {
      return {
        title: '评论删除',
        message: '有朋友删除了评论'
      }
    }
    default:
      return {
        title: '通知',
        message: '您有新的通知'
      }
  }
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // 初始状态
  notifications: [],
  stats: {
    total: 0,
    unread: 0,
    likeCount: 0,
    commentCount: 0
  },
  isLoading: false,
  error: null,
  isNotificationPanelOpen: false,

  // 添加通知
  addNotification: (notification: MessageNotifyDTO<unknown>) => {
    const { notifyType, content } = notification
    const id = generateNotificationId(notifyType)
    const timestamp = new Date().toISOString()
    const { title, message, avatar } = formatNotificationContent(notifyType, content)

    const newNotification: NotificationItem = {
      id,
      type: notifyType,
      content,
      timestamp,
      read: false,
      title,
      message,
      avatar
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }))
    
    get().updateStats()
  },

  // 标记为已读
  markAsRead: (notificationId: string) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    }))
    
    get().updateStats()
  },

  // 标记所有为已读
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        read: true
      }))
    }))
    
    get().updateStats()
  },

  // 移除通知
  removeNotification: (notificationId: string) => {
    set((state) => ({
      notifications: state.notifications.filter(notification => notification.id !== notificationId)
    }))
    
    get().updateStats()
  },

  // 清空所有通知
  clearAll: () => {
    set({
      notifications: [],
      stats: {
        total: 0,
        unread: 0,
        likeCount: 0,
        commentCount: 0
      }
    })
  },

  // 切换通知面板
  toggleNotificationPanel: () => {
    set((state) => ({
      isNotificationPanelOpen: !state.isNotificationPanelOpen
    }))
  },

  // 关闭通知面板
  closeNotificationPanel: () => {
    set({ isNotificationPanelOpen: false })
  },

  // 更新统计信息
  updateStats: () => {
    const notifications = get().notifications
    const unread = notifications.filter(n => !n.read)
    const likeCount = unread.filter(n => n.type === MessageNotifyType.LIKE).length
    const commentCount = unread.filter(n => n.type === MessageNotifyType.COMMENT).length

    set({
      stats: {
        total: notifications.length,
        unread: unread.length,
        likeCount,
        commentCount
      }
    })
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },

  // 好友申请通知处理器
  handleFriendApplicationNotification: (content: FriendApplicationDTO) => {
    get().addNotification({
      notifyType: MessageNotifyType.FRIEND_APPLY,
      content
    })
  },

  // 群聊创建通知处理器
  handleGroupChatCreatedNotification: (content: ChatInfoDTO) => {
    get().addNotification({
      notifyType: MessageNotifyType.CHAT_CREATE,
      content
    })
  },

  // 群聊解散通知处理器
  handleGroupChatDeletedNotification: (chatId: string) => {
    get().addNotification({
      notifyType: MessageNotifyType.CHAT_DELETE,
      content: chatId
    })
  },

  // 动态发布通知处理器
  handleMomentPublishedNotification: (content: MomentDTO) => {
    get().addNotification({
      notifyType: MessageNotifyType.MOMENT_CREATE,
      content
    })
  },

  // 动态删除通知处理器
  handleMomentDeletedNotification: (momentId: string) => {
    get().addNotification({
      notifyType: MessageNotifyType.MOMENT_DELETE,
      content: momentId
    })
  },

  // 点赞通知处理器
  handleMomentLikedNotification: (content: LikeDTO) => {
    get().addNotification({
      notifyType: MessageNotifyType.LIKE,
      content
    })
  },

  // 取消点赞通知处理器
  handleMomentLikeCancelledNotification: (likeId: string) => {
    get().addNotification({
      notifyType: MessageNotifyType.UNLIKE,
      content: likeId
    })
  },

  // 评论通知处理器
  handleMomentCommentedNotification: (content: CommentWithMomentDTO) => {
    get().addNotification({
      notifyType: MessageNotifyType.COMMENT,
      content
    })
  },

  // 删除评论通知处理器
  handleCommentDeletedNotification: (commentId: string) => {
    get().addNotification({
      notifyType: MessageNotifyType.COMMENT_DELETE,
      content: commentId
    })
  },

  // 获取朋友圈相关通知（点赞、评论）
  getMomentNotifications: () => {
    const notifications = get().notifications.filter(n => [MessageNotifyType.LIKE, MessageNotifyType.COMMENT].includes(n.type))
    return notifications
  },

  getMomentStats: () => {
    const notifications = get().notifications.filter(n => [MessageNotifyType.LIKE, MessageNotifyType.COMMENT].includes(n.type))
    const unread = notifications.filter(n => !n.read)
    const likeCount = unread.filter(n => n.type === MessageNotifyType.LIKE).length
    const commentCount = unread.filter(n => n.type === MessageNotifyType.COMMENT).length

    return {
      total: notifications.length,
      unread: unread.length,
      likeCount,
      commentCount
    }
  }
})) 