package lemoon.can.milkyway.facade.dto;

import lombok.Data;

/**
 * @author lemoon
 * @since 2025/6/11
 */
@Data
public class LikeDTO {
    private MomentDescriptionDTO momentDescription;
    private SimpleUserDTO likeUser;
    private String createTime;
}
