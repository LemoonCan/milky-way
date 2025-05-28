package lemoon.can.milkyway.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * @author lemoon
 * @since 2025/5/28
 */
@RestController
@RequestMapping("helper")
@Tag(name = "Helper", description = "辅助接口")
@RequiredArgsConstructor
public class HelperController {
    private final SecureId secureId;

    @PostMapping("/encodeId")
    @Operation(summary = "编码ID")
    public ResponseEntity<Result<String>> encodeId(@RequestParam Long id,
                                                   @RequestParam String type) {
        String salt;
        Class<SecureId> clazz = SecureId.class;
        String methodName = "get" + StringUtils.capitalize(type) + "Salt";
        try {
            Method saltMethod = clazz.getDeclaredMethod(methodName);
            salt = (String) saltMethod.invoke(secureId);
        } catch (NoSuchMethodException|InvocationTargetException|IllegalAccessException e) {
            return ResponseEntity.ok(Result.fail(ErrorCode.UNSUPPORTED, "不支持的类型" + type));
        }
        String encodedId = secureId.encode(id, salt);
        return ResponseEntity.ok(Result.success(encodedId));
    }

}
