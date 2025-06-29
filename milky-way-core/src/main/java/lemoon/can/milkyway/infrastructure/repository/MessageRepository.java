package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.chat.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/15
 */
public interface MessageRepository extends JpaRepository<Message, Long> {
    boolean existsByIdAndChatId(Long id, Long chatId);
}