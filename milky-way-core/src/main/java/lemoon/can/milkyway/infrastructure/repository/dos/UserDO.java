package lemoon.can.milkyway.infrastructure.repository.dos;

import lombok.Data;

import java.time.LocalDateTime;

/**
 *  
 * @author lemoon
 * @since 2025/5/14
 */
@Data
public class UserDO {
    private Long id;
    private String openId;
    private String phone;
    private String password;
    private String nickName;
    private String avatar;
    private String individualSignature;
    private LocalDateTime registerTime;
}