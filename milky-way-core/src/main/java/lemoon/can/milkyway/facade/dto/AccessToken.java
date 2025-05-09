package lemoon.can.milkyway.facade.dto;

import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/9
 */
@Data
public class AccessToken {
    private String objectId;
    private Long expireAt;
    private String signature;
}
