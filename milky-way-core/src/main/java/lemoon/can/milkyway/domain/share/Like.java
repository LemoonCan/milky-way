package lemoon.can.milkyway.domain.share;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    public Like(Long momentId, String likeUserId) {
        this.momentId = momentId;
        this.likeUserId = likeUserId;
    }
}
