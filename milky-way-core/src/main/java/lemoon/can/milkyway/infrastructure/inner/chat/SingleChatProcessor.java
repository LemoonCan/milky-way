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

import java.util.Set;

/**
 * 单聊消息处理器
 * 负责处理单聊消息的推送
 * @author lemoon
 * @since 2025/5/18
 */
@Component("singleChatProcessor")
@RequiredArgsConstructor
public class SingleChatProcessor implements ChatProcessor {
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;
    private final SecureId secureId;

    /**
     * 推送单聊消息
     * 将消息推送给聊天的另一个参与者
     * @param chat 聊天对象
     * @param message 消息对象
     */
    @Override
    public void pushMessage(Chat chat, Message message) {
        // 获取聊天参与者
        Set<Long> participants = chat.getParticipants();

        // 获取发送者信息
        User sender = userRepository.findById(message.getSenderId()).orElseThrow();

        // 创建消息DTO
        MessageDTO messageDTO = messageMapper.toDTO(message, sender);

        // 遍历参与者，向除发送者外的参与者推送消息
        for (Long participantId : participants) {
            // 跳过发送者自己
            if (participantId.equals(message.getSenderId())) {
                continue;
            }

            // 将消息推送到接收者的专属频道
            String userDestination = "/topic/user." + secureId.encode(participantId, secureId.getUserSalt());
            messagingTemplate.convertAndSend(userDestination, messageDTO);
        }
    }
}
