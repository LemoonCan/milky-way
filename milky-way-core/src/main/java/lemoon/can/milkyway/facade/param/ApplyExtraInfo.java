package lemoon.can.milkyway.facade.param;

import lemoon.can.milkyway.common.enums.FriendPermissionEnum;
import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/14
 */
@Data
public class ApplyExtraInfo {
    /**
     * 备注
     */
    private String remark;
    /**
     * 权限
     */
    private FriendPermissionEnum permission;
}
