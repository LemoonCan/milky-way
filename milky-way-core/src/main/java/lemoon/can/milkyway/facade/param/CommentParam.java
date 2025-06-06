package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/6/3
 */
@Data
public class CommentParam implements Serializable {
    @NotBlank(message = "帖子ID不能为空")
    private String momentId;
    private String commentUserId;
    private String parentCommentId;
    @NotBlank(message = "评论内容不能为空")
    private String content;
}
