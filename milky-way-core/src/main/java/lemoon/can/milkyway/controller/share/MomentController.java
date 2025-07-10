package lemoon.can.milkyway.controller.share;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lemoon.can.milkyway.common.utils.security.UserInfoHolder;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.dto.MomentDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.param.CommentParam;
import lemoon.can.milkyway.facade.param.PublishParam;
import lemoon.can.milkyway.facade.service.command.MomentService;
import lemoon.can.milkyway.facade.service.query.MomentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author lemoon
 * @since 2025/6/3
 */
@RestController
@RequestMapping("moments")
@RequiredArgsConstructor
@Tag(name = "moment-api", description = "动态相关接口")
public class MomentController {
    private final MomentService momentService;
    private final MomentQueryService momentQueryService;

    @PostMapping
    @Operation(summary = "发布")
    public ResponseEntity<Result<String>> publish(@RequestBody @Valid PublishParam param) {
        param.setPublishUserId(UserInfoHolder.id());
        String id = momentService.publish(param);
        return ResponseEntity.ok(Result.success(id));
    }

    @DeleteMapping("/{momentId}")
    @Operation(summary = "删除帖子")
    public ResponseEntity<Result<Void>> deletePost(@PathVariable String momentId) {
        momentService.delete(momentId);
        return ResponseEntity.ok(Result.success());
    }

    @PatchMapping("/like")
    @Operation(summary = "点赞")
    public ResponseEntity<Result<String>> like(@RequestParam String momentId) {
        String id = momentService.like(momentId, UserInfoHolder.id());
        return ResponseEntity.ok(Result.success(id));
    }

    @PatchMapping("/unlike")
    @Operation(summary = "取消点赞")
    public ResponseEntity<Result<Void>> unlike(@RequestParam String momentId) {
        momentService.unlike(momentId, UserInfoHolder.id());
        return ResponseEntity.ok(Result.success());
    }


    @PatchMapping("/comment")
    @Operation(summary = "评论")
    public ResponseEntity<Result<Long>> comment(@RequestBody @Valid CommentParam param) {
        param.setCommentUserId(UserInfoHolder.id());
        Long id = momentService.comment(param);
        return ResponseEntity.ok(Result.success(id));
    }

    @GetMapping("/myFriends")
    @Operation(summary = "查询好友动态")
    public ResponseEntity<Result<Slices<MomentDTO>>> myFriendsMoments(@RequestParam String lastId,
                                                             @RequestParam @NotNull Integer pageSize) {
        Slices<MomentDTO> slices = momentQueryService.listFriendMoments(UserInfoHolder.id(), lastId, pageSize);
        return ResponseEntity.ok(Result.success(slices));
    }

    @GetMapping("/my")
    @Operation(summary = "查询我的动态")
    public ResponseEntity<Result<Slices<MomentDTO>>> myMoments(@RequestParam String lastId,
                                                             @RequestParam @NotNull Integer pageSize) {
        Slices<MomentDTO> slices = momentQueryService.listPersonalMoments(UserInfoHolder.id(), lastId, pageSize);
        return ResponseEntity.ok(Result.success(slices));
    }

    @GetMapping("/personal")
    @Operation(summary = "查询个人动态")
    public ResponseEntity<Result<Slices<MomentDTO>>> personalMoments(@RequestParam @NotBlank String userId,
                                                                     @RequestParam String lastId,
                                                                     @RequestParam @NotNull Integer pageSize) {
        Slices<MomentDTO> slices = momentQueryService.listPersonalMoments(userId, lastId, pageSize);
        return ResponseEntity.ok(Result.success(slices));
    }

    @GetMapping("/{momentId}")
    @Operation(summary = "查询动态详情")
    public ResponseEntity<MomentDTO> getMoment(@PathVariable String momentId) {
        MomentDTO moment = momentQueryService.getMoment(momentId);
        return ResponseEntity.ok(moment);
    }
}
