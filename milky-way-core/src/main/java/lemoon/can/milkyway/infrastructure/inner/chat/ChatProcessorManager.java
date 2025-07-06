package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.common.enums.ChatType;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * @author lemoon
 * @since 2025/5/18
 */
@Component
@RequiredArgsConstructor
public class ChatProcessorManager {
    private final Map<String, ChatProcessor> chatProcessorMap;

    public void pushMessage(Chat chat, MessageDTO message) {
        ChatProcessor chatProcessor = chatProcessorMap.get(chat.type().name().toLowerCase() + "ChatProcessor");
        if (chatProcessor == null) {
            throw new BusinessException(ErrorCode.UNSUPPORTED, "不支持的聊天室类型" + chat.type());
        }
        chatProcessor.pushMessage(chat, message);
    }

    public void pushChatCreatedMsg(Long chatId, String operateUserId, ChatType chatType) {
        ChatProcessor chatProcessor = chatProcessorMap.get(chatType.name().toLowerCase() + "ChatProcessor");
        if (chatProcessor == null) {
            throw new BusinessException(ErrorCode.UNSUPPORTED, "不支持的聊天室类型" + chatType);
        }
        chatProcessor.pushChatCreateMsg(chatId, operateUserId);
    }

    public void pushChatDeletedMsg(Long chatId, String operateUserId, ChatType chatType, List<String> memberUserIds) {
        ChatProcessor chatProcessor = chatProcessorMap.get(chatType.name().toLowerCase() + "ChatProcessor");
        if (chatProcessor == null) {
            throw new BusinessException(ErrorCode.UNSUPPORTED, "不支持的聊天室类型" + chatType);
        }
        chatProcessor.pushChatDeleteMsg(chatId, operateUserId, memberUserIds);
    }
}
