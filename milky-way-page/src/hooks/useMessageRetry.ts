import { useMessageManagerStore } from '@/store/messageManager'
import { useChatStore } from '@/store/chat'
import { type ClientMessageDTO } from '@/services/chat'

export const useMessageRetry = () => {
  const { getChatMessages } = useChatStore()

  const retryMessage = async (chatId: string, messageId: string) => {
    // 找到对应的消息并获取其 clientMsgId
    const messages = getChatMessages(chatId)
    const targetMessage = messages.find((msg: ClientMessageDTO) => msg.id === messageId)
    
    if (!targetMessage || !targetMessage.clientMsgId) {
      throw new Error('消息不存在或缺少客户端消息ID')
    }

    // 使用 messageManager 的重试方法
    return useMessageManagerStore.getState().retryMessage(chatId, targetMessage.clientMsgId)
  }

  return { retryMessage }
} 