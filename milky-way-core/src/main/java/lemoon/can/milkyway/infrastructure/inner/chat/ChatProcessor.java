package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.facade.dto.ChatInfoDTO;
import lemoon.can.milkyway.facade.dto.MessageDTO;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/18
 */
public interface ChatProcessor {
    void pushMessage(Chat<?> chat, MessageDTO message);
    /**
     * 聊天室创建
     * @param chatId 群聊ID
     */
    default void pushChatCreateMsg(Long chatId, String operatorUserId, ChatInfoDTO chatInfo){}

    /**
     * 聊天室解散
     * @param chatId 群聊ID
     */
    default void pushChatDeleteMsg(Long chatId, String operatorUserId, List<String> memberUserIds){}
}
