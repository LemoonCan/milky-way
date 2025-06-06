package lemoon.can.milkyway.domain.share;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author lemoon
 * @since 2025/6/3
 */
@Entity
@NoArgsConstructor
@Getter
public class Comment {
    /**
     * 主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    /**
     * 帖子ID
     */
    private Long momentId;
    /**
     * 评论用户ID
     */
    private String commentUserId;
    /**
     * 父评论ID
     */
    @Setter
    private Long parentCommentId;
    /**
     * 评论内容
     */
    private String content;

    public Comment(Long momentId, String commentUserId, String content) {
        this.momentId = momentId;
        this.commentUserId = commentUserId;
        this.content = content;
    }
}
