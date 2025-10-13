package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.chat.Chat;

/**
 * @author lemoon
 * @since 2025/5/18
 */
public interface ChatRepository {
    Chat findById(Long id);
    <T extends Chat<?>> Long save(T chat);
    void delete(Long id);
}
