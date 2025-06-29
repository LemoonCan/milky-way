package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.facade.dto.ChatInfoDTO;
import lemoon.can.milkyway.infrastructure.converter.helper.DateTimeConverterHelper;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatInfoDO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * @author lemoon
 * @since 2025/6/27
 */
@Mapper(componentModel = "spring",
        uses = {UserConverter.class, DateTimeConverterHelper.class, SecureIdConverterHelper.class})
public abstract class ChatConverter {

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeChatId")
    @Mapping(target = "minUnreadMessageId", source = "minUnreadMessageId", qualifiedByName = "encodeMessageId")
    public abstract ChatInfoDTO toDto(ChatInfoDO chatInfoDO);
}
