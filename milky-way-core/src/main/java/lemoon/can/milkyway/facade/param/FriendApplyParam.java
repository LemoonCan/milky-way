package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotBlank;
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
     * 申请人openId
     */
    private String fromOpenId;
    /**
     * 好友openId
     */
    @NotBlank(message = "好友信息不能为空")
    private String toOpenId;
    /**
     * 申请消息
     */
    @NotBlank(message = "申请消息不能为空")
    private String applyMessage;

    /**
     * 附加信息
     */
    private ApplyExtraInfo extraInfo;

}
