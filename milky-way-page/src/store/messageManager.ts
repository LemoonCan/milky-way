import { chatService, type MessageDTO, type MessageMeta, type FileData, type ClientMessageDTO } from '../services/chat'
import { fileService, FilePermission } from '../services/file'
import { useChatStore } from './chat'
import { useUserStore } from './user'
import type { MessageReceipt } from '../utils/websocket'

/**
 * 全局消息管理器单例
 * 统一处理消息发送、状态更新等操作
 */
class MessageManager {
  private static instance: MessageManager | null = null

  private constructor() {}

  /**
   * 获取全局单例实例
   */
  static getInstance(): MessageManager {
    if (!MessageManager.instance) {
      MessageManager.instance = new MessageManager()
    }
    return MessageManager.instance
  }

  /**
   * 生成客户端消息ID
   */
  private generateClientMsgId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 检查用户登录状态
   */
  private validateUser(): { id: string; openId: string; nickName: string; avatar?: string } {
    const currentUser = useUserStore.getState().currentUser
    if (!currentUser) {
      const errorMsg = '用户未登录，无法发送消息'
      console.error(`[MessageManager] ${errorMsg}`)
      throw new Error(errorMsg)
    }
    return currentUser
  }

  /**
   * 添加消息到本地列表
   */
  private addMessageToLocal(
    chatId: string, 
    clientMsgId: string, 
    meta: MessageMeta, 
    fileData?: FileData
  ): string {
    const currentUser = this.validateUser()
    
    useChatStore.getState().addMessage(chatId, {
      id: clientMsgId, // 直接使用 clientMsgId 作为消息ID
      clientMsgId,
      chatId,
      sender: {
        id: currentUser.id,
        openId: currentUser.openId,
        nickName: currentUser.nickName,
        avatar: currentUser.avatar
      },
      meta,
      sentTime: new Date().toISOString(),
      read: false,
      sendStatus: 'sending',
      ...(fileData && { fileData })
    })
    
    console.log(`[MessageManager] 消息已添加到本地列表 - chatId: ${chatId}, clientMsgId: ${clientMsgId}`)
    return clientMsgId
  }

  /**
   * 发送消息到 WebSocket（通用发送逻辑）
   */
  private async sendToWebSocket(
    chatId: string, 
    content: string, 
    messageType: MessageMeta['type'], 
    clientMsgId: string
  ): Promise<void> {
    console.log(`[MessageManager] 开始发送到WebSocket - chatId: ${chatId}, clientMsgId: ${clientMsgId}`)
    
    try {
      await chatService.sendMessage({
        chatId,
        content,
        messageType,
        clientMsgId
      })
      
      // 设置回执超时
      setTimeout(() => {
        const currentMessages = useChatStore.getState().getChatMessages(chatId)
        const message = currentMessages.find(msg => msg.clientMsgId === clientMsgId)
        if (message && message.sendStatus === 'sending') {
          this.updateMessageByClientId(chatId, clientMsgId, { sendStatus: 'failed' })
        }
      }, 15000)
      
      console.log(`[MessageManager] WebSocket发送完成 - clientMsgId: ${clientMsgId}`)
    } catch (error) {
      console.error(`[MessageManager] WebSocket发送失败:`, error)
      
      // 标记消息为发送失败
      this.updateMessageByClientId(chatId, clientMsgId, {
        sendStatus: 'failed'
      })
      
      throw error
    }
  }

  /**
   * 更新消息发送状态
   */
  updateMessageSendStatus(chatId: string, messageId: string, status: 'sending' | 'sent' | 'failed'): void {
    const chatMessages = useChatStore.getState().chatMessagesMap[chatId]
    if (!chatMessages) return

    const updatedMessages = chatMessages.messages.map(msg => 
      msg.id === messageId ? { ...msg, sendStatus: status } : msg
    )

    useChatStore.setState({
      chatMessagesMap: {
        ...useChatStore.getState().chatMessagesMap,
        [chatId]: {
          ...chatMessages,
          messages: updatedMessages
        }
      }
    })
  }

  /**
   * 根据客户端消息ID更新消息
   */
  updateMessageByClientId(chatId: string, clientMsgId: string, updates: Partial<ClientMessageDTO>): void {
    console.log(`[MessageManager] updateMessageByClientId 被调用 - chatId: ${chatId}, clientMsgId: ${clientMsgId}`, updates)
    
    const chatMessages = useChatStore.getState().chatMessagesMap[chatId]
    
    if (!chatMessages) {
      console.warn(`[MessageManager] 找不到聊天 ${chatId} 的消息缓存`)
      return
    }

    console.log(`[MessageManager] 聊天 ${chatId} 共有 ${chatMessages.messages.length} 条消息`)
    
    // 查找目标消息
    const targetMessageIndex = chatMessages.messages.findIndex(msg => msg.clientMsgId === clientMsgId)
    if (targetMessageIndex === -1) {
      console.warn(`[MessageManager] 找不到 clientMsgId 为 ${clientMsgId} 的消息`)
      // 打印所有消息的clientMsgId用于调试
      chatMessages.messages.forEach((msg, index) => {
        console.log(`[MessageManager] 消息 ${index}: id=${msg.id}, clientMsgId=${msg.clientMsgId}, sendStatus=${msg.sendStatus}`)
      })
      return
    }

    console.log(`[MessageManager] 找到目标消息，索引: ${targetMessageIndex}, 当前ID: ${chatMessages.messages[targetMessageIndex].id}, 状态: ${chatMessages.messages[targetMessageIndex].sendStatus}`)

    const updatedMessages = chatMessages.messages.map(msg => 
      msg.clientMsgId === clientMsgId ? { ...msg, ...updates } : msg
    )

    useChatStore.setState({
      chatMessagesMap: {
        ...useChatStore.getState().chatMessagesMap,
        [chatId]: {
          ...chatMessages,
          messages: updatedMessages
        }
      }
    })
    
    console.log(`[MessageManager] 消息更新完成`)
  }

  /**
   * 清除消息发送状态
   */
  clearMessageSendStatus(chatId: string, messageId: string): void {
    const chatMessages = useChatStore.getState().chatMessagesMap[chatId]
    if (!chatMessages) return

    const updatedMessages = chatMessages.messages.map(msg => 
      msg.id === messageId ? { ...msg, sendStatus: undefined } : msg
    )

    useChatStore.setState({
      chatMessagesMap: {
        ...useChatStore.getState().chatMessagesMap,
        [chatId]: {
          ...chatMessages,
          messages: updatedMessages
        }
      }
    })
  }


  /**
   * 发送文本消息
   */
  async sendTextMessage(chatId: string, content: string): Promise<void> {
    const clientMsgId = this.generateClientMsgId()
    
    console.log(`[MessageManager] 发送文本消息 - chatId: ${chatId}, clientMsgId: ${clientMsgId}`)
    
    // 1. 添加消息到本地列表
    const meta: MessageMeta = {
      type: 'TEXT',
      content
    }
    this.addMessageToLocal(chatId, clientMsgId, meta)
    
    // 2. 发送到WebSocket
    await this.sendToWebSocket(chatId, content, 'TEXT', clientMsgId)
  }

  /**
   * 发送文件消息
   */
  async sendFileMessage(chatId: string, file: File): Promise<void> {
    const clientMsgId = this.generateClientMsgId()
    
    // 根据文件类型确定消息类型
    const getMessageTypeFromFile = (file: File): 'IMAGE' | 'VIDEO' | 'FILE' => {
      if (file.type.startsWith('image/')) return 'IMAGE'
      if (file.type.startsWith('video/')) return 'VIDEO'
      return 'FILE'
    }
    
    const messageType = getMessageTypeFromFile(file)
    const previewUrl = URL.createObjectURL(file)
    
    console.log(`[MessageManager] 发送文件消息 - chatId: ${chatId}, clientMsgId: ${clientMsgId}, 类型: ${messageType}`)
    
    // 1. 立即添加消息到本地列表（使用本地预览URL）
    const initialMeta: MessageMeta = {
      type: messageType,
      content: file.name,
      media: previewUrl
    }
    this.addMessageToLocal(chatId, clientMsgId, initialMeta, { originalFile: file })
    
    // 2. 后台上传文件
    try {
      const fileAccessUrl = await this.uploadFile(file, previewUrl, messageType, chatId, clientMsgId)
      // 4. 发送到WebSocket
      await this.sendToWebSocket(chatId, fileAccessUrl, messageType, clientMsgId)
      
    } catch (error) {
      console.error(`[MessageManager] 文件上传失败:`, error)
      
      // 上传失败，标记消息为失败状态（保留本地预览和文件数据用于重试）
      this.updateMessageByClientId(chatId, clientMsgId, {
        sendStatus: 'failed'
      })
      
      throw error
    }
  }

  async uploadFile(file: File, 
    previewUrl: string, 
    messageType: 'IMAGE' | 'VIDEO' | 'FILE',
    chatId: string,
    clientMsgId: string): Promise<string> {
    const uploadResult = await fileService.uploadFile(file, {
      permission: FilePermission.PRIVATE
    })
    

    URL.revokeObjectURL(previewUrl) // 清理本地预览URL
    
    const finalMeta: MessageMeta = {
      type: messageType,
      content: uploadResult.fileAccessUrl,
      media: uploadResult.fileAccessUrl
    }
    
    this.updateMessageByClientId(chatId, clientMsgId, {
      meta: finalMeta,
      fileData: undefined // 上传成功后移除文件数据
    })
    return uploadResult.fileAccessUrl
  }

  /**
   * 处理WebSocket消息
   */
  handleWebSocketMessage(messageDTO: MessageDTO): void {
    console.log('[MessageManager] 收到WebSocket消息:', messageDTO)
    
    // 使用 addRealTimeMessage 处理，它包含了重复检查和群聊逻辑
    useChatStore.getState().addRealTimeMessage(messageDTO.chatId, messageDTO)
  }

  /**
   * 处理消息回执
   */
  handleMessageReceipt(receipt: MessageReceipt): void {
    console.log('[MessageManager] 处理消息回执:', receipt)
    
    try {
      // 回执数据结构是 Result<MessageDTO>
      if (receipt.data) {
        const messageDTO = receipt.data
        
        // 查找对应的本地消息
        const currentMessages = useChatStore.getState().getChatMessages(messageDTO.chatId)
        const localMessage = currentMessages.find(msg => 
          msg.clientMsgId === messageDTO.clientMsgId
        )
        
        if (localMessage) {
          console.log(`[MessageManager] 找到本地消息，更新为服务器消息:`, {
            clientMsgId: messageDTO.clientMsgId,
            serverId: messageDTO.id
          })
          
          // 更新本地消息为服务器返回的完整消息
          this.updateMessageByClientId(messageDTO.chatId, messageDTO.clientMsgId!, {
            id: messageDTO.id, // 更新为服务器ID
            sendStatus: 'sent', // 标记为发送成功
            sentTime: messageDTO.sentTime
          })
        } else {
          console.warn(`[MessageManager] 未找到对应的本地消息:`, messageDTO.clientMsgId)
        }
      } else if (!receipt.success) {
        console.error(`[MessageManager] 消息发送失败:`, receipt.msg)
        // 可以根据错误信息更新对应消息的状态
      }
    } catch (error) {
      console.error('[MessageManager] 处理消息回执时出错:', error)
    }
  }

  /**
   * 重试发送消息
   */
  async retryMessage(chatId: string, clientMsgId: string): Promise<void> {
    const messages = useChatStore.getState().getChatMessages(chatId)
    const message = messages.find(msg => msg.clientMsgId === clientMsgId)
    
    if (!message) {
      throw new Error('未找到要重试的消息')
    }

    if (message.sendStatus !== 'failed') {
      throw new Error('只能重试失败的消息')
    }

    // 根据消息类型重试
    if (message.meta.type === 'TEXT') {
      return this.sendTextMessage(chatId, message.meta.content)
    } else if (message.fileData?.originalFile) {
      // 文件消息，重新上传和发送
      return this.sendFileMessage(chatId, message.fileData.originalFile)
    } else {
      throw new Error('无法重试此消息：缺少必要数据')
    }
  }
}

// 导出全局单例实例
export const messageManager = MessageManager.getInstance() 