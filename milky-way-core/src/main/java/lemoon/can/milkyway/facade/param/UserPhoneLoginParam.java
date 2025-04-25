package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.util.StringUtils;

/**
 * @author lemoon
 * @since 2025/4/25
 */
@Data
public class UserPhoneLoginParam {
    @NotBlank(message = "手机号不能为空")
    private String phone;
    private String password;
    private String captcha;

    @AssertTrue(message = "密码和验证码必填其一")
    public boolean passwordOrCaptcha() {
        return StringUtils.hasLength(password) || StringUtils.hasLength(captcha);
    }
}
