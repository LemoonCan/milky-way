package lemoon.can.milkyway.facade.dto;

import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Data
public class FriendApplicationDTO {
    private String id;
    private UserDTO fromUser;
    private UserDTO toUser;
    private String applyMsg;
}
