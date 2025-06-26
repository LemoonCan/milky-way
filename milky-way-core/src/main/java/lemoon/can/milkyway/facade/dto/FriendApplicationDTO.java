package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.FriendApplyChannel;
import lemoon.can.milkyway.common.enums.FriendApplyStatus;
import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Data
public class FriendApplicationDTO {
    private String id;
    private SimpleUserDTO fromUser;
    private SimpleUserDTO toUser;
    private FriendApplyChannel applyChannel;
    private String applyMsg;
    private FriendApplyStatus status;
    private String createTime;
}
