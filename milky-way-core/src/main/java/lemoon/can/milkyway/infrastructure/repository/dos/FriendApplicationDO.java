package lemoon.can.milkyway.infrastructure.repository.dos;

import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/14
 */
@Data
public class FriendApplicationDO {
    private Long id;
    private String applyMsg;
    private UserDO fromUser;
    private UserDO toUser;
}
