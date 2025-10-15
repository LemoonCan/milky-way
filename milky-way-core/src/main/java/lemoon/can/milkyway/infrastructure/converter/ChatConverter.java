package lemoon.can.milkyway.infrastructure.converter;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import lemoon.can.milkyway.facade.dto.ChatInfoDTO;
import lemoon.can.milkyway.facade.dto.MessageMetaDTO;
import lemoon.can.milkyway.infrastructure.converter.helper.DateTimeConverterHelper;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatInfoDO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

/**
 * @author lemoon
 * @since 2025/6/27
 */
@Mapper(componentModel = "spring",
        uses = {UserConverter.class, DateTimeConverterHelper.class, SecureIdConverterHelper.class})
public abstract class ChatConverter {
    @Autowired
    private MessageConverter messageConverter;

    public ChatInfoDTO toDto(ChatInfoDO chatInfoDO){
        ChatInfoDTO chatInfoDTO = innerToDto(chatInfoDO);
        MessageMetaDTO lastMessageMeta = messageConverter.messageMeta(chatInfoDO.getLastMessageType(), chatInfoDO.getLastMessage());
        chatInfoDTO.setLastMessage(lastMessageMeta.getContent());
        if(StringUtils.hasLength(chatInfoDO.getExtraInfo())){
            JSONObject extraInfo = JSON.parseObject(chatInfoDO.getExtraInfo());
            chatInfoDTO.setAdminUserId(extraInfo.getString("adminUserId"));
        }
        return chatInfoDTO;
    }

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeChatId")
    @Mapping(target = "lastMessageId", source = "lastMessageId", qualifiedByName = "encodeMessageId")
    @Mapping(target = "minUnreadMessageId", source = "minUnreadMessageId", qualifiedByName = "encodeMessageId")
    protected abstract ChatInfoDTO innerToDto(ChatInfoDO chatInfoDO);
}
