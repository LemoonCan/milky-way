package lemoon.can.milkyway.domain.chat;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

/**
 * @author lemoon
 * @since 2025/6/29
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
@Embeddable
public class MessageReadCursorId {
    private String userId;
    private Long chatId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MessageReadCursorId that = (MessageReadCursorId) o;
        return userId.equals(that.userId) && chatId.equals(that.chatId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, chatId);
    }
}

