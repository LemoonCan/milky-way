package lemoon.can.milkyway.common.exception;

import lombok.Getter;

/**
 * @author lemoon
 * @since 2025/9/21
 */
@Getter
public class CustomSecurityException extends RuntimeException {
    private final String errorCode;

    public CustomSecurityException(SecurityErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode.name();
    }
}
