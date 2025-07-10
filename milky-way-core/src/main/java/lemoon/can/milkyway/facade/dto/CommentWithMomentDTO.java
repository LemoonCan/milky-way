package lemoon.can.milkyway.facade.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/7/10
 */
@Data
public class CommentWithMomentDTO implements Serializable {
    /**
     * 评论ID
     */
    private Long id;

    /**
     * 评论的动态ID
     */
    private MomentDescriptionDTO momentDescription;

    /**
     * 父级评论ID
     */
    private Long parentCommentId;

    /**
     * 评论用户信息
     */
    private SimpleUserDTO user;

    /**
     * 评论内容
     */
    private String content;

    /**
     * 评论时间
     */
    private String createTime;

    /**
     * 回复的用户
     */
    private SimpleUserDTO replyUser;
}
