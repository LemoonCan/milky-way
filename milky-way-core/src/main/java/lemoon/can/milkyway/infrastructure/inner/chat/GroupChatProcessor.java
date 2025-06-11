package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.domain.chat.Message;
import lemoon.can.milkyway.facade.dto.MessageContentDTO;
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
    private final SecureId secureId;

    @Override
    public void pushMessage(Chat chat, Message message) {
        // 将消息推送到群聊频道
        String destination = pushDestination(chat);
        //广播
        messagingTemplate.convertAndSend(destination,
                new MessageContentDTO(message.getType(), message.getContent()));
    }

    private String pushDestination(Chat chat) {
        return "/topic/groupChat/" + secureId.simpleEncode(chat.getId(), secureId.getChatSalt());
    }
}
