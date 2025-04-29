package lemoon.can.milkyway.domain.friend;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/4/29
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
@Embeddable
public class FriendId implements Serializable {
    private Long userId;
    private Long friendId;
}
