package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.chat.MessageReadCursor;
import lemoon.can.milkyway.domain.chat.MessageReadCursorId;
import org.springframework.data.repository.CrudRepository;

/**
 * @author lemoon
 * @since 2025/6/29
 */
public interface MessageReadCursorRepository extends CrudRepository<MessageReadCursor, MessageReadCursorId> {
}
