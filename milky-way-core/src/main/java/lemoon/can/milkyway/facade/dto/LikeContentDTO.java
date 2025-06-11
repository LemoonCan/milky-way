package lemoon.can.milkyway.facade.dto;

import lombok.Data;

/**
 * @author lemoon
 * @since 2025/6/11
 */
@Data
public class LikeContentDTO {
    private String momentId;
    private SimpleUserDTO likeUser;
    private String createTime;
}
