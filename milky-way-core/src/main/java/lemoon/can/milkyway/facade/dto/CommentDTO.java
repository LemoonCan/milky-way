package lemoon.can.milkyway.facade.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 评论DTO
 * @author lemoon
 * @since 2025/6/5
 */
@Data
public class CommentDTO {
    /**
     * 评论ID
     */
    private Long id;

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
    private LocalDateTime createTime;
    
    /**
     * 回复列表
     */
    private List<CommentDTO> replies = new ArrayList<>();
}
