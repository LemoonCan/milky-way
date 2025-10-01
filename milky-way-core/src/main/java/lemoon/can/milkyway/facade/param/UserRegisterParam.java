package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/4/25
 */
@Data
public class UserRegisterParam implements Serializable {
    @NotBlank(message = "账号不能为空")
    @Pattern(
            regexp = "^[a-zA-Z0-9_]{4,20}$",
            message = "账号需由4-20位字母、数字或下划线组成"
    )
    private String openId;
    private String phone;
    @NotBlank(message = "密码不能为空")
    @Pattern(
            regexp = "^[a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]{6,20}$",
            message = "密码需由6-20位字母、数字或特殊字符组成"
    )
    private String password;
    @Size(max = 20, message = "昵称不能超过20个字符")
    private String nickName;
    @Size(max = 100, message = "昵称不能超过100个字符")
    private String avatar;
    private String individualSignature;
}
