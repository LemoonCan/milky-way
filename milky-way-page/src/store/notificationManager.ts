import { create } from 'zustand'
import { useNotificationStore } from './notification'
import { useFriendStore } from './friend'
import { useChatStore } from './chat'
import { useMomentStore } from './moment'
import type { 
  MessageNotifyDTO,
  FriendApplicationDTO,
  FriendApplication,
  FriendRelation,
  ChatInfoDTO as NotificationChatInfoDTO,
  LikeDTO,
  CommentWithMomentDTO,
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
    lastMessage: dto.lastMessage || '',
    lastMessageTime: dto.lastMessageTime || new Date().toISOString(),
    unreadCount: dto.unreadCount,
    online: dto.online
  }
}

// 类型转换函数：将FriendApplicationDTO转换为FriendApplication
const convertDTOToApplication = (dto: FriendApplicationDTO): FriendApplication => {
  console.log('开始转换DTO:', dto)
  
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
    updateTime: dto.createTime
  }
  
  console.log('转换完成:', converted)
  return converted
}

export interface NotificationManagerStore {
  // 状态
  activePages: Set<string> // 当前活跃的页面路径
  
  // 方法
  setActivePage: (path: string) => void
  removeActivePage: (path: string) => void
  isPageActive: (path: string) => boolean
  handleNotification: (notification: MessageNotifyDTO<unknown>) => void
}

/**
 * 通知管理器 Store
 * 统一处理所有 WebSocket 通知，无UI层依赖
 */
export const useNotificationManagerStore = create<NotificationManagerStore>()((set, get) => ({
  // 初始状态
  activePages: new Set<string>(),

  // 页面状态管理方法
  setActivePage: (path: string) => {
    set(state => ({
      activePages: new Set([...state.activePages, path])
    }))
  },

  removeActivePage: (path: string) => {
    set(state => {
      const newActivePages = new Set(state.activePages)
      newActivePages.delete(path)
      return { activePages: newActivePages }
    })
  },

  isPageActive: (path: string) => {
    return get().activePages.has(path)
  },

  // 通知处理器 - 无UI依赖版本
  handleNotification: (notification: MessageNotifyDTO<unknown>) => {
    console.log('收到通知:', notification)
    
    const { notifyType, content } = notification

    // 添加到通知系统
    useNotificationStore.getState().addNotification(notification)

    // 根据通知类型处理业务逻辑
    switch (notifyType) {
      case 'FRIEND_APPLY':
        if (content && typeof content === 'object' && 'fromUser' in content) {
          try {
            console.log('处理好友申请通知:', content)
            const application = content as FriendApplicationDTO
            const convertedApplication = convertDTOToApplication(application)
            useFriendStore.getState().addFriendApplicationLocally(convertedApplication)
            console.log('好友申请已添加到本地列表')
          } catch (error) {
            console.error('处理好友申请通知失败:', error)
          }
        } else {
          console.error('好友申请通知内容格式错误:', content)
        }
        break

      case 'NEW_FRIEND':
        if (content && typeof content === 'object' && 'friend' in content) {
          try {
            console.log('处理新好友通知:', content)
            const friendRelation = content as FriendRelation
            
            // 移除页面判断逻辑，总是更新好友列表
            // UI层可以根据需要决定是否刷新显示
            useFriendStore.getState().addFriendLocally(friendRelation)
            console.log('新好友已添加到本地列表')
          } catch (error) {
            console.error('处理新好友通知失败:', error)
          }
        } else {
          console.error('新好友通知内容格式错误:', content)
        }
        break

      case 'CHAT_CREATE':
        if (content && typeof content === 'object' && 'id' in content) {
          const chatInfo = content as NotificationChatInfoDTO
          const serviceChatInfo = convertNotificationChatInfoToServiceChatInfo(chatInfo)
          useChatStore.getState().addChatLocally(serviceChatInfo)
        }
        break

      case 'CHAT_DELETE':
        if (typeof content === 'string') {
          useChatStore.getState().removeChat(content)
        }
        break

      case 'MOMENT_CREATE':
        if (content && typeof content === 'object' && 'user' in content) {
          const momentData = content as MomentDTO
          useMomentStore.getState().addMomentLocally(momentData)
        }
        break

      case 'MOMENT_DELETE':
        if (typeof content === 'string') {
          useMomentStore.getState().removeMomentLocally(content)
        }
        break

      case 'LIKE':
        if (content && typeof content === 'object' && 'user' in content && 'momentDescription' in content) {
          const likeData = content as LikeDTO
          // 移除页面判断，总是更新数据
          if (likeData.momentDescription.id) {
            useMomentStore.getState().addLikeLocally(likeData.momentDescription.id, likeData.user)
          }
        }
        break

      case 'UNLIKE':
        if (content && typeof content === 'object' && 'momentId' in content && 'userId' in content) {
          const unlikeData = content as UnlikeDTO
          useMomentStore.getState().removeLikeLocally(unlikeData.momentId, unlikeData.userId)
        }
        break

      case 'COMMENT':
        if (content && typeof content === 'object' && 'user' in content && 'momentDescription' in content) {
          const commentData = content as CommentWithMomentDTO
          // 移除页面判断，总是更新数据
          if (commentData.momentDescription.id) {
            const localCommentData = {
              id: commentData.id,
              momentId: commentData.momentDescription.id,
              parentCommentId: commentData.parentCommentId,
              user: commentData.user,
              content: commentData.content,
              createTime: commentData.createTime,
              replyUser: commentData.replyUser
            }
            useMomentStore.getState().addCommentLocally(commentData.momentDescription.id, localCommentData)
          }
        }
        break

      case 'COMMENT_DELETE':
        if (typeof content === 'string') {
          useMomentStore.getState().refreshMoments()
        }
        break

      default:
        console.warn('未知的通知类型:', notifyType)
    }
  }
}))