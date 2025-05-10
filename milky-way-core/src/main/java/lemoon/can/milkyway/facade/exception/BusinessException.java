package lemoon.can.milkyway.facade.exception;

import lombok.Getter;

/**
 * @author lemoon
 * @since 2025/5/10
 */
@Getter
public class BusinessException extends RuntimeException {
    private final String errorCode;

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode.name();
    }

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode.name();
    }
}
