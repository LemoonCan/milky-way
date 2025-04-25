package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/4/25
 */
@Data
public class UserRegisterParam implements Serializable {
    private String openId;
    @NotBlank(message = "手机号不能为空")
    private String phone;
    @NotBlank(message = "密码不能为空")
    private String password;
    private String nickName;
    private String avatar;
    private String individualSignature;
}
