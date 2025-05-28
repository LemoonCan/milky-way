package lemoon.can.milkyway.facade.param;

import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/28
 */
@Data
public class UserChangePasswordParam {
    /**
     * 手机号
     */
    String phone;
    /**
     * 旧密码
     */
    String oldPassword;
    /**
     * 新密码
     */
    String newPassword;
    /**
     * 验证码
     */
    String captcha;
}
