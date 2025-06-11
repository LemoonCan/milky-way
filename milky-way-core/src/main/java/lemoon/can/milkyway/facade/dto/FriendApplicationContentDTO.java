package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.FriendApplyStatus;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/6/11
 */
@Data
public class FriendApplicationContentDTO implements Serializable {
    private String id;
    private SimpleUserDTO fromUser;
    private String applyMsg;
    private FriendApplyStatus status;
    private String createTime;
}
