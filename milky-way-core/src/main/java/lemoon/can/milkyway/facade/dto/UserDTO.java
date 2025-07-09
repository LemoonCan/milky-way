package lemoon.can.milkyway.facade.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/4/27
 */
@Data
public class UserDTO implements Serializable {
    /**
     * 用户Id
     */
    protected String id;
    /**
     * 开放Id
     */
    protected String openId;
    /**
     * 手机号
     */
    protected String phone;
    /**
     * 昵称
     */
    protected String nickName;
    /**
     * 头像
     */
    protected String avatar;
    /**
     * 个性签名
     */
    protected String individualSignature;
}
