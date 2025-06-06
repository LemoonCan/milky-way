package lemoon.can.milkyway.domain.share;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

/**
 * @author lemoon
 * @since 2025/6/3
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LikeId {
    private Long momentId;
    private String likeUserId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LikeId oo = (LikeId) o;
        return Objects.equals(momentId, oo.momentId) && Objects.equals(likeUserId, oo.likeUserId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(momentId, likeUserId);
    }
}
