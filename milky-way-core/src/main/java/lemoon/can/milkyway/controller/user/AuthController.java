package lemoon.can.milkyway.controller.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.param.UserPhoneLoginParam;
import lemoon.can.milkyway.facade.param.UserRegisterParam;
import lemoon.can.milkyway.facade.service.UserService;
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
        userService.loginByPhone(param);
        return ResponseEntity.ok(Result.success());
    }

    @PatchMapping("/logout")
    @Operation(summary = "登出")
    public ResponseEntity<Result<Void>> logout(@RequestParam @NotBlank String openId){
        userService.logout(openId);
        return ResponseEntity.ok(Result.success());
    }
}
