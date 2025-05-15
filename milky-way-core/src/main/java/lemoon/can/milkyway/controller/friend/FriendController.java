package lemoon.can.milkyway.controller.friend;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.dto.FriendDTO;
import lemoon.can.milkyway.facade.param.FriendApplyHandleParam;
import lemoon.can.milkyway.facade.param.FriendApplyParam;
import lemoon.can.milkyway.facade.service.command.FriendService;
import lemoon.can.milkyway.facade.service.query.FriendQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/12
 */
@RestController
@RequestMapping("friends")
@RequiredArgsConstructor
public class FriendController {
    private final FriendService friendService;
    private final FriendQueryService friendQueryService;

    @GetMapping("/applications/{openId}")
    @Operation(summary = "获取好友申请列表")
    public ResponseEntity<Result<List<FriendApplicationDTO>>> applications(@PathVariable String openId) {
        List<FriendApplicationDTO> list = friendQueryService.getApplications(openId);
        return ResponseEntity.ok(Result.success(list));
    }

    @PostMapping("/applications/add")
    @Operation(summary = "添加好友")
    public ResponseEntity<Result<Void>> addFriend(@RequestBody @Valid FriendApplyParam param) {
        friendService.addFriend(param);
        return ResponseEntity.ok(Result.success());
    }

    @PostMapping("/applications/handle")
    @Operation(summary = "处理好友请求")
    public ResponseEntity<Result<Void>> handleApplication(@RequestBody @Valid FriendApplyHandleParam param) {
        friendService.handleApplication(param);
        return ResponseEntity.ok(Result.success());
    }

    @GetMapping("/{openId}")
    @Operation(summary = "获取好友列表")
    public ResponseEntity<Result<List<FriendDTO>>> friends(@PathVariable String openId) {
        List<FriendDTO> list = friendQueryService.getFriends(openId);
        return ResponseEntity.ok(Result.success(list));
    }
}
