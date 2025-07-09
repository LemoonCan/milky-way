package lemoon.can.milkyway.controller.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lemoon.can.milkyway.common.utils.security.UserInfoHolder;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.facade.dto.UserDTO;
import lemoon.can.milkyway.facade.dto.UserDetailDTO;
import lemoon.can.milkyway.facade.service.command.UserService;
import lemoon.can.milkyway.facade.service.query.UserQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/4/27
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("users")
@Tag(name = "user-api", description = "用户相关接口")
public class UserController {
    private final UserQueryService userQueryService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "获取所有用户")
    public ResponseEntity<Result<List<UserDTO>>> all() {
        return ResponseEntity.ok(Result.success(userQueryService.getAll()));
    }

    @GetMapping("/userInfo")
    @Operation(summary = "获取当前用户信息")
    public ResponseEntity<Result<SimpleUserDTO>> userInfo() {
        SimpleUserDTO simpleUserDTO = userQueryService.getById(UserInfoHolder.id());
        return ResponseEntity.ok(Result.success(simpleUserDTO));
    }

    @GetMapping("/userDetail")
    @Operation(summary = "获取用户详情")
    public ResponseEntity<Result<UserDetailDTO>> userDetail(@RequestParam String id) {
        UserDetailDTO userDetail = userQueryService.getUserDetailById(id);
        return ResponseEntity.ok(Result.success(userDetail));
    }

    @PostMapping("/userInfo")
    @Operation(summary = "更新当前用户信息")
    public ResponseEntity<Result<Void>> changeUserInfo(@RequestBody UserDTO userDTO) {
        userDTO.setId(UserInfoHolder.id());
        userService.changeInfo(userDTO);
        return ResponseEntity.ok(Result.success(null));
    }

    @PostMapping("/matchByOpenId")
    @Operation(summary = "通过openId匹配用户")
    public ResponseEntity<Result<UserDTO>> matchByOpenId(@RequestParam String openId) {
        UserDTO userDTO = userQueryService.getByOpenId(openId);
        return ResponseEntity.ok(Result.success(userDTO));
    }

    @PostMapping("/matchByPhone")
    @Operation(summary = "通过手机号匹配用户")
    public ResponseEntity<Result<UserDTO>> matchByPhone(@RequestParam String phone) {
        UserDTO userDTO = userQueryService.getByPhone(phone);
        return ResponseEntity.ok(Result.success(userDTO));
    }
}
