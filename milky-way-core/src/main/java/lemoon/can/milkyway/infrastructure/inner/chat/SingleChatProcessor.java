package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.domain.chat.Message;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.infrastructure.converter.MessageConverter;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * 单聊消息处理器
 * 负责处理单聊消息的推送
 *
 * @author lemoon
 * @since 2025/5/18
 */
@Component("singleChatProcessor")
@RequiredArgsConstructor
public class SingleChatProcessor implements ChatProcessor {
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final MessageConverter messageConverter;
    private final SecureId secureId;

    @Override
    public void pushCreateMessage(Chat chat) {

    }

    /**
     * 推送单聊消息
     * 将消息推送给聊天的另一个参与者
     *
     * @param chat    聊天对象
     * @param message 消息对象
     */
    @Override
    public void pushMessage(Chat chat, Message message) {
        User sender = userRepository.findById(message.getSenderId()).orElseThrow();

        // 创建消息DTO
        MessageDTO messageDTO = messageConverter.toDTO(message, sender);

        // 遍历参与者，向除发送者外的参与者推送消息
        for (Long participantId : chat.getParticipants()) {
            // 跳过发送者自己
            if (participantId.equals(message.getSenderId())) {
                continue;
            }

            // 将消息推送到接收者的专属频道
            String encodedUserId = secureId.encode(participantId, secureId.getUserSalt());
            //点对点
            messagingTemplate.convertAndSendToUser(encodedUserId, "/queue/messages", messageDTO);
        }
    }
}
