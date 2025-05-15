package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.FriendPermissionEnum;
import lemoon.can.milkyway.common.FriendStatus;

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
