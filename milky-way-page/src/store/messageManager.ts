import { chatService, MessageMetaHelper, type MessageDTO, type MessageMeta, type FileData, type ClientMessageDTO } from '../services/chat'
import { fileService, FilePermission } from '../services/file'
import { useChatStore } from './chat'
import { useUserStore } from './user'
import type { MessageReceipt } from '../services/websocket'

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
  ): ClientMessageDTO {
    const currentUser = this.validateUser()
    
    const message: ClientMessageDTO = {
      id: clientMsgId, // 直接使用 clientMsgId 作为消息ID
      clientMsgId,
      chatId,
      sender: {
        id: currentUser.id,
        openId: currentUser.openId,
        nickName: currentUser.nickName,
        avatar: currentUser.avatar,
      },
      meta,
      sentTime: new Date().toISOString(),
      read: false,
      sendStatus: "sending",
      ...(fileData && { fileData }),
    };
    useChatStore.getState().addMessage(message);
    
    console.log(`[MessageManager] 消息已添加到本地列表 - chatId: ${chatId}, clientMsgId: ${clientMsgId}`)
    return message
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
    const chatMessages = useChatStore.getState().chatMessagesMap[chatId]
    
    if (!chatMessages) {
      console.warn(`[MessageManager] 找不到聊天 ${chatId} 的消息缓存`)
      return
    }
    
    // 直接查找目标消息
    const originalMessage = chatMessages.messages.find(msg => msg.clientMsgId === clientMsgId)
    if (!originalMessage) {
      return
    }

    const updatedMessage = { ...originalMessage, ...updates }
    
    const updatedMessages = chatMessages.messages.map(msg => 
      msg.clientMsgId === clientMsgId ? updatedMessage : msg
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
   * 将消息移动到最新位置
   */
  moveAndUpdateMessageToLatest(chatId: string, clientMsgId: string, updates: Partial<ClientMessageDTO>): ClientMessageDTO {    
    const chatMessages = useChatStore.getState().chatMessagesMap[chatId]
    
    if (!chatMessages) {
      throw new Error(`[MessageManager] 找不到聊天 ${chatId} 的消息缓存`)
    }
    
    // 找到目标消息
    const targetMessage = chatMessages.messages.find(msg => msg.clientMsgId === clientMsgId)
    if (!targetMessage) {
      throw new Error(`[MessageManager] 找不到聊天 ${chatId} 的消息缓存`)
    }

    const updatedMessage = { ...targetMessage, ...updates }
    
    // 移除原位置的消息
    const otherMessages = chatMessages.messages.filter(msg => msg.clientMsgId !== clientMsgId)
    
    // 将消息添加到最后
    const reorderedMessages = [...otherMessages, updatedMessage]
    
    useChatStore.setState({
      chatMessagesMap: {
        ...useChatStore.getState().chatMessagesMap,
        [chatId]: {
          ...chatMessages,
          messages: reorderedMessages,
          newestMessageId: targetMessage.id
        }
      }
    })
    
    return targetMessage
  }


  /**
   * 发送文本消息
   */
  async sendTextMessage(chatId: string, content: string, message?: ClientMessageDTO): Promise<void> {
    if (!message){
      // 新消息：添加到本地列表
      const meta: MessageMeta = {
        type: "TEXT",
        content,
      };
      message = this.addMessageToLocal(chatId, this.generateClientMsgId(), meta);
    }

    // 发送到WebSocket
    await this.sendToWebSocket(chatId,message.meta.content!,"TEXT",message.clientMsgId!);
  }

  /**
   * 发送文件消息
   */
  async sendFileMessage(chatId: string, file?: File, message?: ClientMessageDTO): Promise<void> {
    if (!message) {
      // 新消息：立即添加消息到本地列表（使用本地预览URL）
      if (!file) {
        throw new Error("文件为空");
      }
      const previewUrl = URL.createObjectURL(file);
      const initialMeta: MessageMeta = {
        type: MessageMetaHelper.getMessageTypeFromFile(file),
        content: file.name,
      };
      MessageMetaHelper.setRealUrl(initialMeta, previewUrl);
      message = this.addMessageToLocal(
        chatId,
        this.generateClientMsgId(),
        initialMeta,
        { originalFile: file }
      );
    }

    // 后台上传文件（重发时也需要重新上传）
    if (file) {
      // 需要上传文件
      await this.uploadFile(message);
    }
    // 发送到WebSocket
    await this.sendToWebSocket(
      chatId,
      MessageMetaHelper.getRealUrl(message.meta)!,
      message.meta.type,
      message.clientMsgId!
    );
    
  }

  async uploadFile(message: ClientMessageDTO): Promise<void> {
    if (!message.fileData?.originalFile) {
      throw new Error("文件为空");
    }
    try {
      const uploadResult = await fileService.uploadFile(
        message.fileData.originalFile,
        {
          permission: FilePermission.PRIVATE,
        }
      );

      const previewUrl = MessageMetaHelper.getRealUrl(message.meta);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); // 清理本地预览URL
      }

      MessageMetaHelper.setRealUrl(message.meta, uploadResult.fileAccessUrl);

      this.updateMessageByClientId(message.chatId, message.clientMsgId!, {
        meta: message.meta,
        fileData: undefined, // 上传成功后移除文件数据
      });
    } catch (error) {
      if (message.clientMsgId) {
        // 上传失败，标记消息为失败状态（保留本地预览和文件数据用于重试）
        this.updateMessageByClientId(message.chatId, message.clientMsgId, {
          sendStatus: "failed",
        });
      }
      throw error;
    }
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
      if (receipt.success) {
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
            sentTime: messageDTO.sentTime,
            meta: messageDTO.meta, // 更新媒体信息（封面图、视频URL等）
            fileData: undefined // 清除本地文件数据，因为已经上传成功
          })
        } else {
          console.warn(`[MessageManager] 未找到对应的本地消息:`, messageDTO.clientMsgId)
        }
      } else {
        const failMessage = receipt.data;
        // 可以根据错误信息更新对应消息的状态
        this.updateMessageByClientId(failMessage.chatId, failMessage.clientMsgId!, {
          sendStatus: "failed",
        });
      }
    } catch (error) {
      console.error('[MessageManager] 处理消息回执时出错:', error)
    }
  }

  /**
   * 重试发送消息
   */
  async retryMessage(chatId: string, clientMsgId: string): Promise<void> {
    // 将消息更新并移动到最新位置
    const message = this.moveAndUpdateMessageToLatest(chatId, clientMsgId, {
      sentTime: new Date().toISOString(),
      sendStatus: 'sending'
    })

    // 根据消息类型重试
    if (message.meta.type === 'TEXT') {
      return this.sendTextMessage(chatId, message.meta.content!, message)
    } else {
      // 文件消息，重新上传和发送
      return this.sendFileMessage(chatId, message.fileData?.originalFile, message)
    } 
  }
}

// 导出全局单例实例
export const messageManager = MessageManager.getInstance() 