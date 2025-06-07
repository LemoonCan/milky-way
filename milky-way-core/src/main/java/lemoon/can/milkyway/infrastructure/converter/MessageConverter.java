package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.domain.chat.Message;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import org.springframework.stereotype.Component;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@Component
public class MessageConverter {
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
        SimpleUserDTO senderDTO = new SimpleUserDTO();
        senderDTO.setId(sender.getId());
        senderDTO.setNickName(sender.getNickName());
        senderDTO.setAvatar(sender.getAvatar());
        messageDTO.setSender(senderDTO);
        return messageDTO;
    }
}
