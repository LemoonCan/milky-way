package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.infrastructure.converter.MessageConverter2;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

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

    @Override
    public void pushMessage(Chat chat, MessageDTO message) {
        // 将消息推送到群聊频道
        String destination = pushDestination(chat);
        //广播
        messagingTemplate.convertAndSend(destination,
                messageConverter2.messageContentDTO(message));
    }

    private String pushDestination(Chat chat) {
        return "/topic/groupChat/" + secureIdConverterHelper.encodeChatId(chat.getId());
    }
}
