package lemoon.can.milkyway.facade.dto;

import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Data
public class FriendApplicationDTO {
    private String id;
    private SimpleUserDTO fromUser;
    private SimpleUserDTO toUser;
    private String applyMsg;
}
