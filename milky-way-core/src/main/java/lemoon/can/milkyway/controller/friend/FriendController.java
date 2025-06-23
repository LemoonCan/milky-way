package lemoon.can.milkyway.controller.friend;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lemoon.can.milkyway.common.utils.security.UserInfoHolder;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.dto.FriendDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.param.FriendApplyHandleParam;
import lemoon.can.milkyway.facade.param.FriendApplyParam;
import lemoon.can.milkyway.facade.param.FriendOperateParam;
import lemoon.can.milkyway.facade.param.FriendsQueryParam;
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
@Tag(name = "friend-api", description = "好友相关接口")
public class FriendController {
    private final FriendService friendService;
    private final FriendQueryService friendQueryService;

    @GetMapping("/applications")
    @Operation(summary = "获取好友申请列表")
    public ResponseEntity<Result<List<FriendApplicationDTO>>> applications() {
        List<FriendApplicationDTO> list = friendQueryService.getApplications(UserInfoHolder.id());
        return ResponseEntity.ok(Result.success(list));
    }

    @PostMapping("/applications/add")
    @Operation(summary = "添加好友")
    public ResponseEntity<Result<Void>> addFriend(@RequestBody @Valid FriendApplyParam param) {
        param.setFromUserId(UserInfoHolder.id());
        friendService.addFriend(param);
        return ResponseEntity.ok(Result.success());
    }

    @PostMapping("/applications/handle")
    @Operation(summary = "处理好友请求")
    public ResponseEntity<Result<Void>> handleApplication(@RequestBody @Valid FriendApplyHandleParam param) {
        param.setUserId(UserInfoHolder.id());
        friendService.handleApplication(param);
        return ResponseEntity.ok(Result.success());
    }

    @GetMapping
    @Operation(summary = "获取好友列表")
    public ResponseEntity<Result<Slices<FriendDTO>>> friends(@RequestParam(required = false) Character lastLetter,
                                                             @RequestParam(required = false) String lastNickName,
                                                             @RequestParam int pageSize) {
        FriendsQueryParam param = new FriendsQueryParam();
        param.setUserId(UserInfoHolder.id());
        param.setLastLetter(lastLetter);
        param.setLastNickName(lastNickName);
        param.setPageSize(pageSize);
        Slices<FriendDTO> friends = friendQueryService.getFriends(param);
        return ResponseEntity.ok(Result.success(friends));
    }

    @DeleteMapping
    @Operation(summary = "删除好友")
    public ResponseEntity<Result<Void>> deleteFriend(@RequestParam @Valid String friendUserId) {
        FriendOperateParam param = new FriendOperateParam(UserInfoHolder.id(), friendUserId);
        friendService.deleteFriend(param);
        return ResponseEntity.ok(Result.success());
    }

    @PatchMapping("/block")
    @Operation(summary = "拉黑好友")
    public ResponseEntity<Result<Void>> blockFriend(@RequestParam @Valid String friendUserId) {
        FriendOperateParam param = new FriendOperateParam(UserInfoHolder.id(), friendUserId);
        friendService.blockFriend(param);
        return ResponseEntity.ok(Result.success());
    }

    @PatchMapping("/unblock")
    @Operation(summary = "解除好友拉黑")
    public ResponseEntity<Result<Void>> unblockFriend(@RequestParam @Valid String friendUserId) {
        FriendOperateParam param = new FriendOperateParam(UserInfoHolder.id(), friendUserId);
        friendService.unblockFriend(param);
        return ResponseEntity.ok(Result.success());
    }
}
