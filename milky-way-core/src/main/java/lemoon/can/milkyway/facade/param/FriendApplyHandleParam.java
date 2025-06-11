package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lemoon.can.milkyway.common.enums.FriendApplyStatus;
import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/12
 */
@Data
public class FriendApplyHandleParam {
    /**
     * 本人ID
     */
    private String userId;
    /**
     * 好友申请ID
     */
    @NotBlank(message = "好友申请ID不能为空")
    private String friendApplicationId;
    /**
     * 处理结果
     */
    @NotNull(message = "处理结果不能为空")
    private FriendApplyStatus status;
    /**
     * 附加信息
     */
    private ApplyExtraInfo extraInfo;
}
