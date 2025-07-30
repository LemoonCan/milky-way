package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.common.enums.MessageType;
import lemoon.can.milkyway.domain.chat.Message;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.MessageMetaDTO;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.dto.MessageInfoDTO;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.facade.service.command.FileService;
import lemoon.can.milkyway.infrastructure.converter.helper.DateTimeConverterHelper;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.MessageDO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.format.DateTimeFormatter;

/**
 * @author lemoon
 * @since 2025/6/27
 */
@Mapper(componentModel = "spring",
        uses = {DateTimeConverterHelper.class, SecureIdConverterHelper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class MessageConverter {
    @Autowired
    private SecureIdConverterHelper secureIdConverterHelper;
    @Autowired
    private FileService fileService;

    public MessageDTO toDTO(Message message, User sender) {
        if (message == null) {
            return null;
        }
        MessageDTO messageDTO = new MessageDTO();
        messageDTO.setId(secureIdConverterHelper.encodeMessageId(message.getId()));
        messageDTO.setChatId(secureIdConverterHelper.encodeChatId(message.getChatId()));
        messageDTO.setMeta(messageMeta(message.getType(), message.getContent()));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        messageDTO.setSentTime(formatter.format(message.getSentTime()));
        SimpleUserDTO senderDTO = new SimpleUserDTO();
        senderDTO.setId(sender.getId());
        senderDTO.setNickName(sender.getNickName());
        senderDTO.setAvatar(sender.getAvatar());
        messageDTO.setSender(senderDTO);
        return messageDTO;
    }

    public MessageDTO toMessageDTO(MessageDO message) {
        MessageDTO messageDTO = innerToMessageDTO(message);
        if (messageDTO == null) {
            return null;
        }
        messageDTO.setMeta(messageMeta(message.getType(), message.getContent()));
        return messageDTO;
    }

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeMessageId")
    @Mapping(target = "chatId", source = "chatId", qualifiedByName = "encodeChatId")
    protected abstract MessageDTO innerToMessageDTO(MessageDO message);

    public MessageInfoDTO toMessageInfoDTO(MessageDO message) {
        MessageInfoDTO messageInfoDTO = innerToMessageInfoDTO(message);
        if (messageInfoDTO == null) {
            return null;
        }
        messageInfoDTO.setMeta(messageMeta(message.getType(), message.getContent()));
        return messageInfoDTO;
    }


    @Mapping(target = "id", source = "id", qualifiedByName = "encodeMessageId")
    @Mapping(target = "chatId", source = "chatId", qualifiedByName = "encodeChatId")
    protected abstract MessageInfoDTO innerToMessageInfoDTO(MessageDO message);

    public MessageInfoDTO messageContentDTO(MessageDTO message) {
        MessageInfoDTO messageInfoDTO = innerMessageContentDTO(message);
        if (messageInfoDTO == null) {
            return null;
        }
        messageInfoDTO.setMeta(message.getMeta());
        return messageInfoDTO;
    }

    protected abstract MessageInfoDTO innerMessageContentDTO(MessageDTO message);

    /**
     * 创建消息元数据
     *
     * @param messageType 消息类型
     * @param content     消息内容
     * @return 消息元数据
     */
    public MessageMetaDTO messageMeta(MessageType messageType, String content) {
        MessageMetaDTO messageMeta = new MessageMetaDTO();
        if (messageType == null) {
            return messageMeta;
        }
        messageMeta.setType(messageType);
        if(messageType.isMedia()) {
            if(fileService.expire(content)) {
                return messageMeta;
            }
        }
        messageMeta.setContent(content);
        switch (messageType) {
            case IMAGE:
                messageMeta.setContent("[" + messageType.getDesc() + "]");
                messageMeta.setMedia(content);
                break;
            case VIDEO:
                messageMeta.setContent("[" + messageType.getDesc() + "]");
                messageMeta.setMedia(fileService.getVideoCoverImageAccessUrl(content));
                messageMeta.setVideoUrl(content);
                break;
            case FILE:
                messageMeta.setContent(fileService.getFileName(content));
                messageMeta.setMedia(content);
                break;
        }

        return messageMeta;
    }
}
