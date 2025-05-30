package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.domain.chat.Message;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.param.MessageSendParam;
import lemoon.can.milkyway.facade.service.command.MessageService;
import lemoon.can.milkyway.infrastructure.inner.chat.ChatProcessorManager;
import lemoon.can.milkyway.infrastructure.converter.MessageConverter;
import lemoon.can.milkyway.infrastructure.repository.ChatRepository;
import lemoon.can.milkyway.infrastructure.repository.MessageRepository;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final MessageConverter messageMapper;
    private final SecureId secureId;
    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final ChatProcessorManager chatProcessorManager;

    @Override
    public MessageDTO sendMessage(MessageSendParam param) {
        Message message = new Message(secureId.decode(param.getChatId(), secureId.getChatSalt()),
                param.getSenderUserId(),
                param.getMessageType(), param.getContent());
        message = messageRepository.save(message);
        User sender = userRepository.findById(message.getSenderId()).orElseThrow(
                () -> new BusinessException(ErrorCode.NOT_FOUND, "Sender not found"));
        MessageDTO messageDTO = messageMapper.toDTO(message, sender);

        //消息推送
        Chat chat = chatRepository.findById(message.getChatId());
        chatProcessorManager.pushMessage(chat, message);

        return messageDTO;
    }
}
