package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.FriendPermissionEnum;
import lemoon.can.milkyway.common.enums.FriendStatus;

/**
 * @author lemoon
 * @since 2025/5/15
 */
public class FriendDTO {
    private UserDTO friend;
    private String remark;
    private FriendStatus status;
    private FriendPermissionEnum permission;
}
