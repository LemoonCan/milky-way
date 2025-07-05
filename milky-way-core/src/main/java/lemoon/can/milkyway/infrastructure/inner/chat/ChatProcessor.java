package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.facade.dto.MessageDTO;

/**
 * @author lemoon
 * @since 2025/5/18
 */
public interface ChatProcessor {
    void pushMessage(Chat chat, MessageDTO message);
    /**
     * 聊天室创建
     * @param chatId 群聊ID
     */
    default void chatCreateMsg(Long chatId, String operatorUserId){}

    /**
     * 聊天室解散
     * @param chatId 群聊ID
     */
    default void chatDeleteMsg(Long chatId, String operatorUserId){}
}
