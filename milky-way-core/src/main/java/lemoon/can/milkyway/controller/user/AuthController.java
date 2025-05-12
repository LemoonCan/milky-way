package lemoon.can.milkyway.controller.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.param.UserPhoneLoginParam;
import lemoon.can.milkyway.facade.param.UserRegisterParam;
import lemoon.can.milkyway.facade.service.UserService;
import lemoon.can.milkyway.utils.security.HttpHeaderToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author lemoon
 * @since 2025/4/23
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("auth")
@Tag(name = "auth-api", description = "用户认证相关接口")
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "注册")
    public ResponseEntity<Result<Void>> register(@RequestBody @Valid UserRegisterParam param){
        userService.register(param);
        return ResponseEntity.ok(Result.success());
    }

    @PatchMapping("/loginByPhone")
    @Operation(summary = "手机号登录")
    public ResponseEntity<Result<Void>> loginByPhone(@RequestBody @Valid UserPhoneLoginParam param){
        String token = userService.loginByPhone(param);
        return ResponseEntity
                .ok()
                .header(HttpHeaderToken.key(), HttpHeaderToken.wrapToken(token))
                .body(Result.success());
    }

    @PatchMapping("/logout")
    @Operation(summary = "登出")
    public ResponseEntity<Result<Void>> logout(@RequestParam String openId){
        //JWT 无状态方案，只需前端删除本地 token 即可
        return ResponseEntity.ok(Result.success());
    }
}
