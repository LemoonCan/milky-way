package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * @author lemoon
 * @since 2025/4/25
 */
@Data
public class UserOpenIdLoginParam {
    @NotBlank(message = "账号")
    private String openId;
    @NotBlank(message = "密码不能为空")
    private String password;
}
