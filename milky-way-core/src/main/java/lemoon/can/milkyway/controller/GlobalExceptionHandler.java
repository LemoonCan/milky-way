package lemoon.can.milkyway.controller;

import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * @author lemoon
 * @since 2025/4/26
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Result<Void>> handle(BadCredentialsException ex){
        log.error("认证失败", ex);
        return ResponseEntity.ok(Result.fail(ErrorCode.UNCERTIFIED,"用户名或密码错误"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return ResponseEntity.ok(Result.fail(ErrorCode.INVALID_PARAM, errorMessage));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Result<Void>> handleValidationExceptions(IllegalArgumentException ex) {
        log.error("参数错误", ex);
        return ResponseEntity.ok(Result.fail(ErrorCode.INVALID_PARAM, ex.getMessage()));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Result<Void>> handleBusinessExceptions(BusinessException ex) {
        log.error("业务异常", ex);
        return ResponseEntity.ok(Result.fail(ex.getErrorCode(), ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<Void>> handleAllExceptions(Exception ex) {
        log.error("系统错误", ex);
        return ResponseEntity.ok(Result.fail(ErrorCode.SYSTEM_ERROR));
    }
}
