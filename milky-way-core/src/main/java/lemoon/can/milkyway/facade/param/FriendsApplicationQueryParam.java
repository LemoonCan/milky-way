package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/6/23
 */
@Data
public class FriendsApplicationQueryParam implements Serializable {
    /**
     * 接收者的用户ID
     */
    private String userId;

    /**
     * 上个ID（用于分页）
     */
    private String lastId;

    /**
     * 每页大小
     */
    @NotNull(message = "分页大小不能为空")
    private Integer pageSize;
}
