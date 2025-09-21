package lemoon.can.milkyway.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author lemoon
 * @since 2025/9/21
 */
@AllArgsConstructor
@Getter
public enum SecurityErrorCode {
    UNCERTIFIED("未认证"),
    TOKEN_EXPIRED("登录已过期，请重新登录"),
    TOKEN_INVALID("限制访问"),
    ANOTHER_LOGIN("账号在另一处登录")
    ;
    private final String message;
}
