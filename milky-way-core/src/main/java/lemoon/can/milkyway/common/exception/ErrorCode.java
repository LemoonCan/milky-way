package lemoon.can.milkyway.common.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author lemoon
 * @since 2025/5/10
 */
@AllArgsConstructor
@Getter
public enum ErrorCode {
    INVALID_PARAM("非法参数"),
    NOT_FOUND("资源不存在"),
    UNSUPPORTED("不支持的操作"),
    SYSTEM_ERROR("系统错误"),
    UNCERTIFIED("未认证"),
    ;
    private final String message;
}
