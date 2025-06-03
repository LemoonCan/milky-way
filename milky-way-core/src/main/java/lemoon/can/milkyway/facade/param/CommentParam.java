package lemoon.can.milkyway.facade.param;

import org.springframework.web.bind.annotation.RequestParam;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/6/3
 */
public class CommentParam implements Serializable {
    private String shareId;
    private String parentCommentId;
    private String comment;
}
