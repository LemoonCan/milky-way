package lemoon.can.milkyway.infrastructure.mapper;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.chat.Message;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@Component
@RequiredArgsConstructor
public class MessageMapper {
    private final SecureId secureId;

    public MessageDTO toDTO(Message message, User sender) {
        if (message == null) {
            return null;
        }
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setId(message.getId());
        messageDTO.setChatId(message.getChatId());
        messageDTO.setType(message.getType());
        messageDTO.setContent(message.getContent());
        messageDTO.setSentTime(message.getSentTime());
        messageDTO.setReadTime(message.getReadTime());
        messageDTO.setRead(message.getReadTime() != null);
        UserDTO senderDTO = new UserDTO();
        senderDTO.setId(secureId.encode(sender.getId(), secureId.getUserSalt()));
        senderDTO.setNickName(sender.getNickName());
        senderDTO.setAvatar(sender.getAvatar());
        messageDTO.setSender(senderDTO);
        return messageDTO;
    }
}
