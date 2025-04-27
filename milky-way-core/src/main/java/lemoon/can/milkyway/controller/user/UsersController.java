package lemoon.can.milkyway.controller.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.dto.UserDTO;
import lemoon.can.milkyway.facade.repository.UserQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author lemoon
 * @since 2025/4/27
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("users")
@Tag(name = "users-api", description = "用户相关接口")
public class UsersController {
    private final UserQueryRepository userQueryRepository;
    @PostMapping("/matchByOpenId")
    @Operation(summary = "通过openId匹配用户")
    public ResponseEntity<Result<UserDTO>> matchByOpenId(String openId) {
        return ResponseEntity.ok(Result.success(null));
    }

    @PostMapping("/matchByPhone")
    @Operation(summary = "通过手机号匹配用户")
    public ResponseEntity<Result<UserDTO>> matchByPhone(String phone) {
        return ResponseEntity.ok(Result.success(null));
    }
}
