package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotBlank;
import lemoon.can.milkyway.common.enums.FriendApplyChannel;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author lemoon
 * @since 2025/5/12
 */
@Data
@NoArgsConstructor
public class FriendApplyParam {
    /**
     * 申请人ID
     */
    private String fromUserId;
    /**
     * 好友ID
     */
    @NotBlank(message = "好友信息不能为空")
    private String toUserId;
    /**
     * 申请渠道
     */
    @NotBlank(message = "申请渠道不能为空")
    FriendApplyChannel applyChannel;
    /**
     * 申请消息
     */
    private String applyMessage;

    /**
     * 附加信息
     */
    private ApplyExtraInfo extraInfo;

}
