package lemoon.can.milkyway.controller.chat;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lemoon.can.milkyway.common.utils.security.UserInfoHolder;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.dto.*;
import lemoon.can.milkyway.facade.param.*;
import lemoon.can.milkyway.facade.service.command.ChatService;
import lemoon.can.milkyway.facade.service.query.ChatQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
@Tag(name = "chat-api", description = "聊天相关接口")
public class ChatController {
    private final ChatService chatService;
    private final ChatQueryService chatQueryService;

    @PostMapping
    @Operation(summary = "创建聊天室")
    public ResponseEntity<Result<ChatDTO>> createChat(@RequestBody @Valid ChatCreateParam param) {
        ChatDTO chatDTO = chatService.createChat(param);
        return ResponseEntity.ok(Result.success(chatDTO));
    }

    @DeleteMapping("/{chatId}")
    @Operation(summary = "解散聊天室")
    public ResponseEntity<Result<Void>> deleteChat(@PathVariable @Valid String chatId) {
        ChatDeleteParam chatDeleteParam = new ChatDeleteParam();
        chatDeleteParam.setChatId(chatId);
        chatService.deleteChat(chatDeleteParam);
        return ResponseEntity.ok(Result.success());
    }

    @PatchMapping
    @Operation(summary = "更新聊天室信息")
    public ResponseEntity<Result<Void>> updateChatInfo(@RequestBody @Valid ChatUpdateParam param) {
        chatService.updateChat(param);
        return ResponseEntity.ok(Result.success());
    }

    @PostMapping("/members")
    @Operation(summary = "删除聊天室成员")
    public ResponseEntity<Result<Void>> addMember(@RequestParam String chatId,
                                                  @RequestParam String userId) {
        chatService.addMember(chatId, userId);
        return ResponseEntity.ok(Result.success());
    }

    @DeleteMapping("/members")
    @Operation(summary = "添加聊天室成员")
    public ResponseEntity<Result<Void>> deleteMember(@RequestParam String chatId,
                                                     @RequestParam String userId) {
        chatService.deleteMember(chatId, userId);
        return ResponseEntity.ok(Result.success());
    }

    @PatchMapping("/members")
    @Operation(summary = "更新聊天室成员信息")
    public ResponseEntity<Result<Void>> updateMemberInfo(@RequestBody @Valid ChatMemberParam param) {
        chatService.updateMemerInfo(param);
        return ResponseEntity.ok(Result.success());
    }

    @GetMapping("/groupChats")
    @Operation(summary = "获取群聊列表")
    public ResponseEntity<Result<List<String>>> groupChats() {
        List<String> groupChats = chatQueryService.getGroupChats(UserInfoHolder.id());
        return ResponseEntity.ok(Result.success(groupChats));
    }

    @GetMapping
    @Operation(summary = "查询聊天列表")
    public ResponseEntity<Result<Slices<ChatInfoDTO>>> getChatList(@RequestParam(required = false) String lastId,
                                                                   @RequestParam Integer pageSize) {
        Slices<ChatInfoDTO> chatList = chatQueryService.getChatList(UserInfoHolder.id(), lastId, pageSize);
        return ResponseEntity.ok(Result.success(chatList));
    }

    @GetMapping("/messages/{chatId}")
    @Operation(summary = "查询聊天消息")
    public ResponseEntity<Result<Slices<MessageInfoDTO>>> getChatMessages(@PathVariable String chatId,
                                                                          @RequestParam(required = false) String before,
                                                                          @RequestParam(required = false) String after,
                                                                          @RequestParam Integer pageSize) {
        ChatMessagesQueryParam param = new ChatMessagesQueryParam();
        param.setChatId(chatId);
        param.setBefore(before);
        param.setAfter(after);
        param.setPageSize(pageSize);
        param.setOperatorUserId(UserInfoHolder.id());
        Slices<MessageInfoDTO> slices = chatQueryService.getChatMessages(param);
        return ResponseEntity.ok(Result.success(slices));
    }

    @PatchMapping("/read")
    public ResponseEntity<Result<Void>> read(@RequestParam String chatId) {
        return null;
    }
}
