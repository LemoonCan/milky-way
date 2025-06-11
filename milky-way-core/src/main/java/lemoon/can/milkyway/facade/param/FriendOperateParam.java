package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author lemoon
 * @since 2025/6/11
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class FriendOperateParam {
    /**
     * 申请人ID
     */
    private String fromUserId;
    /**
     * 好友ID
     */
    @NotBlank(message = "好友信息不能为空")
    private String toUserId;
}
