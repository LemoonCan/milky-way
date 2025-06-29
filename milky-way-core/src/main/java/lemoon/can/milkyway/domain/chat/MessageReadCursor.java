package lemoon.can.milkyway.domain.chat;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CurrentTimestamp;

import java.time.LocalDateTime;

/**
 * @author lemoon
 * @since 2025/6/29
 */
@Entity
@NoArgsConstructor
@Getter
public class MessageReadCursor {
    @EmbeddedId
    private MessageReadCursorId id;

    private Long lastReadMessageId;

    @CurrentTimestamp
    private LocalDateTime readTime;

    public MessageReadCursor(MessageReadCursorId id, Long lastReadMessageId) {
        this.id = id;
        this.lastReadMessageId = lastReadMessageId;
    }

    public void markRead(Long lastReadMessageId) {
        this.lastReadMessageId = lastReadMessageId;
    }
}
