import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { webSocketClient } from '../utils/websocket'
import { useNotificationStore } from '../store/notification'
import { useFriendStore } from '../store/friend'
import { useChatStore } from '../store/chat'
import { useMomentStore } from '../store/moment'
import type { 
  MessageNotifyDTO,
  FriendApplicationDTO,
  FriendApplication,
  FriendRelation,
  ChatInfoDTO as NotificationChatInfoDTO,
  // 重新导入需要的类型
  LikeDTO,
  CommentDTO,
  UnlikeDTO,
  MomentDTO
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
  const location = useLocation()
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
  const { addFriendApplicationLocally, addFriendLocally } = useFriendStore()
  const { addChatLocally, removeChatUser } = useChatStore()
  const { refreshMoments, addLikeLocally, addCommentLocally, removeLikeLocally, addMomentLocally, removeMomentLocally } = useMomentStore()
  // 所有本地更新方法都已导入

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

      case 'NEW_FRIEND':
        // 新好友通知
        if (content && typeof content === 'object' && 'friend' in content) {
          try {
            console.log('处理新好友通知:', content)
            const friendRelation = content as FriendRelation
            
            // 检查当前是否在好友页面
            const isOnFriendPage = location.pathname.includes('/friends')
            console.log('当前页面路径:', location.pathname, '是否在好友页面:', isOnFriendPage)
            
            if (isOnFriendPage) {
              addFriendLocally(friendRelation)
              console.log('新好友已添加到本地列表（用户在好友页面）')
            } else {
              console.log('用户不在好友页面，跳过更新好友列表')
            }
          } catch (error) {
            console.error('处理新好友通知失败:', error)
          }
        } else {
          console.error('新好友通知内容格式错误:', content)
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
          // 使用本地更新而不是重新请求接口
          const momentData = content as MomentDTO
          addMomentLocally(momentData)
        }
        break

      case 'MOMENT_DELETE':
        // 动态删除通知
        if (typeof content === 'string') {
          // 使用本地更新而不是重新请求接口
          removeMomentLocally(content)
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
        if (content && typeof content === 'object' && 'momentId' in content && 'userId' in content) {
          // 使用本地更新而不是重新请求接口
          const unlikeData = content as UnlikeDTO
          removeLikeLocally(unlikeData.momentId, unlikeData.userId)
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
    location.pathname,
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
    addFriendLocally,
    addChatLocally,
    removeChatUser,
    refreshMoments,
    addLikeLocally,
    addCommentLocally,
    removeLikeLocally,
    addMomentLocally,
    removeMomentLocally
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