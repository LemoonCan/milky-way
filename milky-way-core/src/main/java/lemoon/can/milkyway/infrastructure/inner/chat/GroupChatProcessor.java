package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.domain.chat.Message;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.infrastructure.mapper.MessageMapper;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;
    private final SecureId secureId;

    @Override
    public void pushCreateMessage(Chat chat) {

    }

    @Override
    public void pushMessage(Chat chat, Message message) {
        User sender = userRepository.findById(message.getSenderId()).orElseThrow();
        // 创建消息DTO
        MessageDTO messageDTO = messageMapper.toDTO(message, sender);

        // 将消息推送到群聊频道
        String destination = pushDestination(chat);
        //广播
        messagingTemplate.convertAndSend(destination, messageDTO);
    }

    private String pushDestination(Chat chat) {
        String chatIdEncoded = secureId.encode(chat.getId(), secureId.getChatSalt());
        return "/topic/chat/" + chatIdEncoded;
    }
}
