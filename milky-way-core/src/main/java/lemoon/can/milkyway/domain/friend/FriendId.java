package lemoon.can.milkyway.domain.friend;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

/**
 * @author lemoon
 * @since 2025/4/29
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
@Embeddable
public class FriendId implements Serializable {
    /**
     * 用户id
     */
    private String userId;
    /**
     * 好友id
     */
    private String friendId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FriendId oo = (FriendId) o;
        return Objects.equals(userId, oo.userId) && Objects.equals(friendId, oo.friendId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, friendId);
    }

}
