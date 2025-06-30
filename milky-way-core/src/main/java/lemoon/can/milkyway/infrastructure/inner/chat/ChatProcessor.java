package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.facade.dto.MessageDTO;

/**
 * @author lemoon
 * @since 2025/5/18
 */
public interface ChatProcessor {
    void pushMessage(Chat chat, MessageDTO message);
}
