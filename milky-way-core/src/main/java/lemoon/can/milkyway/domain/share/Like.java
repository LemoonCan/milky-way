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
    private Long postId;
    @Id
    private String likeUserId;

    public Like(Long postId, String likeUserId) {
        this.postId = postId;
        this.likeUserId = likeUserId;
    }
}
