package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.domain.chat.Message;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.Optional;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@Component
@RequiredArgsConstructor
public class MessageConverter {
    private final SecureIdConverterHelper secureIdConverterHelper;

    public MessageDTO toDTO(Message message, User sender) {
        if (message == null) {
            return null;
        }
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setId(secureIdConverterHelper.encodeMessageId(message.getId()));
        messageDTO.setChatId(secureIdConverterHelper.encodeChatId(message.getChatId()));
        messageDTO.setType(message.getType());
        messageDTO.setContent(message.getContent());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        messageDTO.setSentTime(formatter.format(message.getSentTime()));
        SimpleUserDTO senderDTO = new SimpleUserDTO();
        senderDTO.setId(sender.getId());
        senderDTO.setNickName(sender.getNickName());
        senderDTO.setAvatar(sender.getAvatar());
        messageDTO.setSender(senderDTO);
        return messageDTO;
    }
}
