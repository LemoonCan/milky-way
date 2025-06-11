package lemoon.can.milkyway.facade.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/6/11
 */
@Data
public class CommentContentDTO implements Serializable {
    private String momentId;
    private SimpleUserDTO commentUser;
    private String content;
    private String createTime;
}
