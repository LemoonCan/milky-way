package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.MomentContentType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 动态DTO
 * @author lemoon
 * @since 2025/6/5
 */
@Data
public class MomentDTO {
    private String id;
    private SimpleUserDTO user;
    private MomentContentType contentType;
    private String text;
    private List<String> medias;
    private String location;
    private Integer likeCounts;
    private Integer commentCounts;
    private LocalDateTime creatTime;
    
    /**
     * 点赞用户列表
     */
    private List<SimpleUserDTO> likeUsers;
    
    /**
     * 评论列表
     */
    private List<CommentDTO> comments;
}
