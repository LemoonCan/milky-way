package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.common.enums.MessageNotifyType;
import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.facade.dto.ChatInfoDTO;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.dto.MessageNotifyDTO;
import lemoon.can.milkyway.infrastructure.converter.ChatConverter;
import lemoon.can.milkyway.infrastructure.converter.MessageConverter2;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.inner.MessageDestination;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatInfoDO;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatMemberDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 群聊消息处理器
 * 负责处理群聊消息的推送
 *
 * @author lemoon
 * @since 2025/5/18
 */
@Component("groupChatProcessor")
@RequiredArgsConstructor
public class GroupChatProcessor implements ChatProcessor {
    private final SimpMessagingTemplate messagingTemplate;
    private final SecureIdConverterHelper secureIdConverterHelper;
    private final MessageConverter2 messageConverter2;
    private final ChatMapper chatMapper;
    private final ChatMemberMapper chatMemberMapper;
    private final ChatConverter chatConverter;

    @Override
    public void pushMessage(Chat chat, MessageDTO message) {
        // 将消息推送到群聊频道
        String destination = pushDestination(chat);
        //广播
        messagingTemplate.convertAndSend(destination,
                messageConverter2.messageContentDTO(message));
    }

    @Override
    public void chatCreateMsg(Long chatId, String operatorUserId) {
        ChatInfoDO chatInfoDO = chatMapper.selectChatInfoById(chatId);
        ChatInfoDTO chatInfoDTO = chatConverter.toDto(chatInfoDO);
        MessageNotifyDTO<ChatInfoDTO> payload = new MessageNotifyDTO<>();
        payload.setNotifyType(MessageNotifyType.CHAT_CREATE);
        payload.setContent(chatInfoDTO);

        List<ChatMemberDO> chatMemberDOS = chatMemberMapper.selectByChatId(chatId);
        for (ChatMemberDO chatMemberDO : chatMemberDOS) {
            if (!chatMemberDO.getUserId().equals(operatorUserId)) {
                messagingTemplate.convertAndSendToUser(chatMemberDO.getUserId(), MessageDestination.NOTIFY_DEST, payload);
            }
        }
    }

    @Override
    public void chatDeleteMsg(Long chatId, String operatorUserId) {
        MessageNotifyDTO<String> payload = new MessageNotifyDTO<>();
        payload.setNotifyType(MessageNotifyType.CHAT_DELETE);
        payload.setContent(secureIdConverterHelper.encodeChatId(chatId));

        List<ChatMemberDO> chatMemberDOS = chatMemberMapper.selectByChatId(chatId);
        for (ChatMemberDO chatMemberDO : chatMemberDOS) {
            if (!chatMemberDO.getUserId().equals(operatorUserId)) {
                messagingTemplate.convertAndSendToUser(chatMemberDO.getUserId(), MessageDestination.NOTIFY_DEST, payload);
            }
        }
    }

    private String pushDestination(Chat chat) {
        return "/topic/groupChat/" + secureIdConverterHelper.encodeChatId(chat.getId());
    }
}
