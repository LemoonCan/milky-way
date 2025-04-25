package lemoon.can.milkyway.controller.user;

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
@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Result<Void>> register(@RequestBody @Valid UserRegisterParam param){
        userService.register(param);
        return ResponseEntity.ok(Result.success());
    }

    @PostMapping("/login/phone")
    public ResponseEntity<Result<Void>> loginByPhone(@RequestBody @Valid UserPhoneLoginParam param){
        userService.loginByPhone(param);
        return ResponseEntity.ok(Result.success());
    }

    @PostMapping("/logout")
    public ResponseEntity<Result<Void>> logout(@RequestParam @NotBlank Long openId){
        userService.logout(openId);
        return ResponseEntity.ok(Result.success());
    }
}
