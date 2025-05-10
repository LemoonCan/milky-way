package lemoon.can.milkyway.controller;

import lemoon.can.milkyway.facade.exception.BusinessException;
import lemoon.can.milkyway.facade.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * @author lemoon
 * @since 2025/4/26
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.ok(Result.fail(ErrorCode.INVALID_PARAM, errors.toString()));
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
}
