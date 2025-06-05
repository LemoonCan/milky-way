package lemoon.can.milkyway.controller.share;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lemoon.can.milkyway.common.utils.security.UserInfoHolder;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.param.CommentParam;
import lemoon.can.milkyway.facade.param.PublishParam;
import lemoon.can.milkyway.facade.service.command.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author lemoon
 * @since 2025/6/3
 */
@RestController
@RequestMapping("posts")
@RequiredArgsConstructor
@Tag(name = "post-api", description = "动态相关接口")
public class PostController {
    private final PostService postService;

    @PostMapping
    @Operation(summary = "发布")
    public ResponseEntity<Result<String>> publish(@RequestBody @Valid PublishParam param) {
        String id = postService.publish(param);
        return ResponseEntity.ok(Result.success(id));
    }

    @DeleteMapping("/{postId}")
    @Operation(summary = "删除帖子")
    public ResponseEntity<Result<Void>> deletePost(@PathVariable String postId) {
        postService.delete(postId);
        return ResponseEntity.ok(Result.success());
    }

    @PatchMapping("/like")
    @Operation(summary = "点赞")
    public ResponseEntity<Result<Void>> like(@RequestParam String postId) {
        postService.like(postId, UserInfoHolder.id());
        return ResponseEntity.ok(Result.success());
    }

    @PatchMapping("/unlike")
    @Operation(summary = "取消点赞")
    public ResponseEntity<Result<Void>> unlike(@RequestParam String postId) {
        postService.unlike(postId, UserInfoHolder.id());
        return ResponseEntity.ok(Result.success());
    }


    @PatchMapping("/comment")
    @Operation(summary = "评论")
    public ResponseEntity<Result<String>> comment(@RequestBody @Valid CommentParam param) {
        param.setCommentUserId(UserInfoHolder.id());
        String id = postService.comment(param);
        return ResponseEntity.ok(Result.success(id));
    }
}
