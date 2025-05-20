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
 * 群聊消息处理器
 * 负责处理群聊消息的推送
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

    /**
     * 推送群聊消息
     * 将消息推送给群聊中的所有参与者（除发送者外）
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

        // 获取聊天室ID的安全编码
        String chatIdEncoded = secureId.encode(message.getChatId(), secureId.getChatSalt());

        // 将消息推送到群聊频道
        String groupDestination = "/topic/chat." + chatIdEncoded;
        messagingTemplate.convertAndSend(groupDestination, messageDTO);

        // 也可以选择向每个参与者的个人频道推送
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
