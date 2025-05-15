package lemoon.can.milkyway.infrastructure.repository.dos;

import lemoon.can.milkyway.common.enums.FriendPermissionEnum;
import lemoon.can.milkyway.common.enums.FriendStatus;
import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@Data
public class FriendDO {
    /**
     * 备注
     */
    private String remark;
    /**
     * 状态
     */
    private FriendStatus status;
    /**
     * 权限
     */
    private FriendPermissionEnum permission;
    /**
     * 好友信息
     */
    private UserDO friend;
}
