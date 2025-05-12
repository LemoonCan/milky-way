package lemoon.can.milkyway.controller.friend;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.param.FriendApplyHandleParam;
import lemoon.can.milkyway.facade.param.FriendApplyParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author lemoon
 * @since 2025/5/12
 */
@RestController
@RequestMapping("friends")
@RequiredArgsConstructor
public class FriendController {
    @PostMapping("/add")
    @Operation(summary = "添加好友")
    public ResponseEntity<Result<Void>> addFriend(@RequestBody @Valid FriendApplyParam param) {
        return ResponseEntity.ok(Result.success());
    }

    @PostMapping("/handleApplication")
    @Operation(summary = "处理好友请求")
    public ResponseEntity<Result<Void>> handleApplication(@RequestBody @Valid FriendApplyHandleParam param) {
        return ResponseEntity.ok(Result.success());
    }
}
