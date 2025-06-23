package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/6/23
 */
@Data
public class FriendsQueryParam implements Serializable {
    /**
     * 用户ID
     */
    private String userId;

    /**
     * 上个昵称首字母（用于分页）
     */
    private Character lastLetter;

    /**
     * 上个昵称（用于分页）
     */
    private String lastNickName;

    /**
     * 每页大小
     */
    @NotNull(message = "分页大小不能为空")
    private Integer pageSize;
}
