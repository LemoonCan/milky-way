package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.common.enums.MessageSenderType;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.dto.MessageInfoDTO;
import lemoon.can.milkyway.infrastructure.converter.helper.DateTimeConverterHelper;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.MessageDO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * @author lemoon
 * @since 2025/6/27
 */
@Mapper(componentModel = "spring",
        uses = {DateTimeConverterHelper.class, SecureIdConverterHelper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class MessageConverter2 {

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeMessageId")
    @Mapping(target = "chatId", source = "chatId", qualifiedByName = "encodeChatId")
    public abstract MessageDTO toMessageDTO(MessageDO message);

    public MessageInfoDTO toMessageInfoDTO(MessageDO message, String currentUserId) {
        MessageInfoDTO messageInfoDTO = innerToMessageInfoDTO(message);
        messageInfoDTO.setSenderType(message.getSender().getId().equals(currentUserId) ?
                MessageSenderType.me : MessageSenderType.other);
        return messageInfoDTO;
    }

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeMessageId")
    @Mapping(target = "chatId", source = "chatId", qualifiedByName = "encodeChatId")
    protected abstract MessageInfoDTO innerToMessageInfoDTO(MessageDO message);
}
