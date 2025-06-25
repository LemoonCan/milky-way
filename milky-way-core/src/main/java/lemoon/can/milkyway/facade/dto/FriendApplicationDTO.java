package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.FriendApplyStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Data
public class FriendApplicationDTO {
    private String id;
    private SimpleUserDTO fromUser;
    private SimpleUserDTO toUser;
    private String applyMsg;
    private FriendApplyStatus status;
    private String createTime;
}
