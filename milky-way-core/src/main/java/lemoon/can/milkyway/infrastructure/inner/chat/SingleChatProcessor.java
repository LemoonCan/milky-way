package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.domain.chat.ChatMember;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.infrastructure.converter.MessageConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * 单聊消息处理器
 * 负责处理单聊消息的推送
 *
 * @author lemoon
 * @since 2025/5/18
 */
@Slf4j
@Component("singleChatProcessor")
@RequiredArgsConstructor
public class SingleChatProcessor implements ChatProcessor {
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageConverter messageConverter;

    /**
     * 推送单聊消息
     * 将消息推送给聊天的另一个参与者
     *
     * @param chat    聊天对象
     * @param message 消息对象
     */
    @Override
    public void pushMessage(Chat chat, MessageDTO message) {
        // 遍历参与者，向除发送者外的参与者推送消息
        for (ChatMember member : chat.getMembers()) {
            // 跳过发送者自己
            if (member.getUserId().equals(message.getSender().getId())) {
                continue;
            }

            //点对点
            messagingTemplate.convertAndSendToUser(member.getUserId(), "/queue/messages",
                    messageConverter.messageContentDTO(message));
        }
    }
}
