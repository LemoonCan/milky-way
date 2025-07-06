import { useEffect } from 'react'
import { webSocketClient } from '../utils/websocket'
import { useNotificationStore } from '../store/notification'
import { useFriendStore } from '../store/friend'
import { useChatStore } from '../store/chat'
import { useMomentStore } from '../store/moment'
import type { 
  MessageNotifyDTO,
  FriendApplicationDTO,
  FriendApplication,
  ChatInfoDTO as NotificationChatInfoDTO,
  // 移除不再使用的类型
  // MomentDTO,
  LikeDTO,
  CommentDTO
} from '../types/api'
import type { ChatInfoDTO as ChatServiceChatInfoDTO } from '../services/chat'

// 类型转换函数：将通知中的ChatInfoDTO转换为聊天服务的ChatInfoDTO
const convertNotificationChatInfoToServiceChatInfo = (dto: NotificationChatInfoDTO): ChatServiceChatInfoDTO => {
  return {
    id: dto.id,
    chatType: dto.chatType,
    title: dto.title,
    avatar: dto.avatar,
    lastMessage: dto.lastMessage || '', // 提供默认值
    lastMessageTime: dto.lastMessageTime || new Date().toISOString(), // 提供默认值
    unreadCount: dto.unreadCount,
    online: dto.online
  }
}

// 类型转换函数：将FriendApplicationDTO转换为FriendApplication
const convertDTOToApplication = (dto: FriendApplicationDTO): FriendApplication => {
  console.log('开始转换DTO:', dto)
  
  // 处理toUser为null的情况
  const toUser = dto.toUser || {
    id: 'unknown',
    openId: null,
    nickName: '未知用户',
    avatar: undefined
  }
  
  const converted = {
    id: dto.id,
    fromUser: {
      id: dto.fromUser.id,
      openId: dto.fromUser.openId,
      nickName: dto.fromUser.nickName,
      nickNameFirstLetter: dto.fromUser.nickName.charAt(0).toUpperCase(),
      avatar: dto.fromUser.avatar
    },
    toUser: {
      id: toUser.id,
      openId: toUser.openId,
      nickName: toUser.nickName,
      nickNameFirstLetter: toUser.nickName.charAt(0).toUpperCase(),
      avatar: toUser.avatar
    },
    applyMsg: dto.applyMsg,
    applyChannel: dto.applyChannel,
    status: dto.status,
    createTime: dto.createTime,
    updateTime: dto.createTime // 使用createTime作为updateTime的默认值
  }
  
  console.log('转换完成:', converted)
  return converted
}

export const useWebSocketNotifications = () => {
  const {
    addNotification,
    // 移除这些不再需要的处理函数
    // handleFriendApplicationNotification,
    // handleGroupChatCreatedNotification,
    // handleGroupChatDeletedNotification,
    // handleMomentPublishedNotification,
    // handleMomentDeletedNotification,
    // handleMomentLikedNotification,
    // handleMomentLikeCancelledNotification,
    // handleMomentCommentedNotification,
    // handleCommentDeletedNotification
  } = useNotificationStore()

  // 获取各个store的刷新方法
  const { addFriendApplicationLocally } = useFriendStore()
  const { addChatLocally, removeChatUser } = useChatStore()
  const { refreshMoments, addLikeLocally, addCommentLocally } = useMomentStore()
  // 移除暂时不用的 currentUser 和 removeLikeLocally

  // 通知处理器
  const handleNotification = (notification: MessageNotifyDTO<unknown>) => {
    console.log('收到通知:', notification)
    
    const { notifyType, content } = notification

    // 添加到通知系统（只调用一次）
    addNotification(notification)

    // 根据通知类型处理业务逻辑（不再重复添加通知）
    switch (notifyType) {
      case 'FRIEND_APPLY':
        // 好友申请通知
        if (content && typeof content === 'object' && 'fromUser' in content) {
          try {
            console.log('处理好友申请通知:', content)
            // 只处理业务逻辑，不再重复添加通知
            const application = content as FriendApplicationDTO
            const convertedApplication = convertDTOToApplication(application)
            addFriendApplicationLocally(convertedApplication)
            console.log('好友申请已添加到本地列表')
          } catch (error) {
            console.error('处理好友申请通知失败:', error)
          }
        } else {
          console.error('好友申请通知内容格式错误:', content)
        }
        break

      case 'CHAT_CREATE':
        // 群聊创建通知
        if (content && typeof content === 'object' && 'id' in content) {
          const chatInfo = content as NotificationChatInfoDTO
          // 只处理业务逻辑，不再重复添加通知
          const serviceChatInfo = convertNotificationChatInfoToServiceChatInfo(chatInfo)
          addChatLocally(serviceChatInfo)
        }
        break

      case 'CHAT_DELETE':
        // 群聊解散通知
        if (typeof content === 'string') {
          // 只处理业务逻辑，不再重复添加通知
          removeChatUser(content)
        }
        break

      case 'MOMENT_CREATE':
        // 动态发布通知
        if (content && typeof content === 'object' && 'user' in content) {
          // 只处理业务逻辑，不再重复添加通知
          refreshMoments()
        }
        break

      case 'MOMENT_DELETE':
        // 动态删除通知
        if (typeof content === 'string') {
          // 只处理业务逻辑，不再重复添加通知
          refreshMoments()
        }
        break

      case 'LIKE':
        // 点赞通知
        if (content && typeof content === 'object' && 'likeUser' in content) {
          // 使用本地更新而不是重新请求接口
          const likeData = content as LikeDTO
          addLikeLocally(likeData.momentId, likeData.likeUser)
        }
        break

      case 'UNLIKE':
        // 取消点赞通知
        if (typeof content === 'string') {
          // 只处理业务逻辑，不再重复添加通知
          // 暂时不处理取消点赞逻辑
        }
        break

      case 'COMMENT':
        // 评论通知
        if (content && typeof content === 'object' && 'user' in content) {
          // 使用本地更新而不是重新请求接口
          const commentData = content as CommentDTO
          if (commentData.momentId) {
            addCommentLocally(commentData.momentId, commentData)
          } else {
            // 如果没有 momentId，回退到刷新模式
            refreshMoments()
          }
        }
        break

      case 'COMMENT_DELETE':
        // 删除评论通知
        if (typeof content === 'string') {
          // 只处理业务逻辑，不再重复添加通知
          refreshMoments()
        }
        break

      default:
        console.warn('未知的通知类型:', notifyType)
    }
  }

  useEffect(() => {
    console.log('[Notifications] 使用全局WebSocket客户端，添加通知处理器')
    
    // 使用全局WebSocket客户端实例
    webSocketClient.addNotificationHandler(handleNotification)

    // 清理函数
    return () => {
      console.log('[Notifications] 移除通知处理器')
      webSocketClient.removeNotificationHandler(handleNotification)
    }
  }, [
    addNotification,
    // 移除这些不再需要的处理函数
    // handleFriendApplicationNotification,
    // handleGroupChatCreatedNotification,
    // handleGroupChatDeletedNotification,
    // handleMomentPublishedNotification,
    // handleMomentDeletedNotification,
    // handleMomentLikedNotification,
    // handleMomentLikeCancelledNotification,
    // handleMomentCommentedNotification,
    // handleCommentDeletedNotification,
    addFriendApplicationLocally,
    addChatLocally,
    removeChatUser,
    refreshMoments,
    addLikeLocally,
    addCommentLocally
  ])

  // 返回全局WebSocket客户端实例
  return {
    wsClient: webSocketClient
  }
}

// 导出WebSocket客户端实例获取函数
export const getWebSocketClient = () => {
  return webSocketClient
} 