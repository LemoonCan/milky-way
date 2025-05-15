package lemoon.can.milkyway.facade.dto;

import lombok.Data;

/**
 * @author lemoon
 * @since 2025/4/27
 */
@Data
public class UserDTO {
    /**
     * 开放Id
     */
    private String openId;
    /**
     * 手机号
     */
    private String phone;
    /**
     * 昵称
     */
    private String nickName;
    /**
     * 头像
     */
    private String avatar;
    /**
     * 个性签名
     */
    private String individualSignature;
}
