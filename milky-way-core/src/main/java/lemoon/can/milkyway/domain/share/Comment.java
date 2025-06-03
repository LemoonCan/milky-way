package lemoon.can.milkyway.domain.share;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    private Long id;
    /**
     * 帖子ID
     */
    private Long postId;
    /**
     * 评论用户ID
     */
    private String commentUserId;
    /**
     * 父评论ID
     */
    private Long parentCommentId;
    /**
     * 评论内容
     */
    private String content;
}
