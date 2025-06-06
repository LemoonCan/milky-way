package lemoon.can.milkyway.domain.share;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * @author lemoon
 * @since 2025/6/3
 */
@Entity(name = "likes")
@IdClass(LikeId.class)
@NoArgsConstructor
@Getter
public class Like {
    @Id
    private Long momentId;
    @Id
    private String likeUserId;

    public Like(Long momentId, String likeUserId) {
        this.momentId = momentId;
        this.likeUserId = likeUserId;
    }
}
