package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.common.enums.MessageType;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.chat.Message;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.param.MessageSendParam;
import lemoon.can.milkyway.facade.service.command.MessageService;
import lemoon.can.milkyway.infrastructure.mapper.MessageMapper;
import lemoon.can.milkyway.infrastructure.repository.MessageRepository;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.Long;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {
    private final MessageRepository messageRepository;
    private final MessageMapper messageMapper;
    private final SecureId secureId;
    private final UserRepository userRepository;

    @Override
    public MessageDTO sendMessage(MessageSendParam param) {
        Message message = new Message(secureId.decode(param.getChatId(), secureId.getChatSalt()),
                secureId.decode(param.getSenderUserId(), secureId.getUserSalt()),
                param.getMessageType(), param.getContent());
        message = messageRepository.save(message);

        User sender = userRepository.findById(message.getSenderId()).orElseThrow(
                () -> new BusinessException(ErrorCode.NOT_FOUND, "Sender not found"));

        //消息推送
        return messageMapper.toDTO(message);
    }

    private void pushMessage(Message message) {
        //单聊、群聊
    }

    @Override
    @Transactional
    public MessageDTO markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Message not found"));

        message.markAsRead();
        message = messageRepository.save(message);

        return enrichMessageDTO(messageMapper.toDTO(message));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDTO> getMessagesBetweenUsers(java.lang.Long longId1, java.lang.Long longId2) {
        validateUsers(longId1, longId2);

        List<Message> messages = messageRepository.findMessagesBetweenUsers(longId1, longId2);
        return messages.stream()
                .map(messageMapper::toDTO)
                .map(this::enrichMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDTO> getUnreadMessages(java.lang.Long longId) {
        validateUser(longId);

        List<Message> messages = messageRepository.findByReceiverIdAndReadTimeIsNullOrderBySentTimeAsc(longId);
        return messages.stream()
                .map(messageMapper::toDTO)
                .map(this::enrichMessageDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDTO> getLatestMessages(java.lang.Long longId) {
        validateUser(longId);

        List<Message> messages = messageRepository.findLatestMessagesForUser(longId);
        return messages.stream()
                .map(messageMapper::toDTO)
                .map(this::enrichMessageDTO)
                .collect(Collectors.toList());
    }

    /**
     * Validate that both users exist
     */
    private void validateUsers(java.lang.Long longId1, java.lang.Long longId2) {
        validateUser(longId1);
        validateUser(longId2);
    }

    /**
     * Validate that a user exists
     */
    private void validateUser(java.lang.Long longId) {
        if (!userRepository.existsById(longId)) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "User not found");
        }
    }

    /**
     * Enrich MessageDTO with user information
     */
    private MessageDTO enrichMessageDTO(MessageDTO messageDTO) {
        Long sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Sender not found"));

        Long receiver = userRepository.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Receiver not found"));

        messageDTO.setSenderNickname(sender.getNickName());
        messageDTO.setSenderAvatar(sender.getAvatar());
        messageDTO.setReceiverNickname(receiver.getNickName());
        messageDTO.setReceiverAvatar(receiver.getAvatar());

        return messageDTO;
    }
}
