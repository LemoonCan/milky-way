package lemoon.can.milkyway.facade.param;

import lemoon.can.milkyway.domain.friend.FriendApplyStatus;
import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/12
 */
@Data
public class FriendApplyHandleParam {
    /**
     * 本人openId
     */
    private String openId;
    /**
     * 好友申请ID
     */
    private String friendApplicationId;
    /**
     * 处理结果
     */
    private FriendApplyStatus status;
    /**
     * 附加信息
     */
    private ApplyExtraInfo extraInfo;
}
