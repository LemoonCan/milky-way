package lemoon.can.milkyway.infrastructure.repository.dos;

import lemoon.can.milkyway.facade.dto.UserDTO;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 评论DTO
 * @author lemoon
 * @since 2025/6/5
 */
@Data
public class CommentDO {
    /**
     * 评论ID
     */
    private Long id;

    /**
     * 父评论id
     */
    private Long parentCommentId;

    /**
     * 评论用户信息
     */
    private UserDO user;
    
    /**
     * 评论内容
     */
    private String content;
    
    /**
     * 评论时间
     */
    private LocalDateTime createTime;

    /**
     * 层级
     */
    private int level;
}
