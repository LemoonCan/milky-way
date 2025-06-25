package lemoon.can.milkyway.infrastructure.repository.dos;

import lemoon.can.milkyway.common.enums.FriendApplyStatus;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * @author lemoon
 * @since 2025/5/14
 */
@Data
public class FriendApplicationDO {
    private Long id;
    private String applyMsg;
    private FriendApplyStatus status;
    private LocalDateTime createTime;
    private UserDO fromUser;
    private UserDO toUser;
}
