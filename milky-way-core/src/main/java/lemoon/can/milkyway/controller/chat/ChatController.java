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
    public ResponseEntity<Result<ChatInfoDTO>> createChat(@RequestBody @Valid ChatCreateParam param) {
        param.setOperateUserId(UserInfoHolder.id());
        param.getMembers().add(param.getOperateUserId());
        param.setDefaultMessage(String.format("%s聊天室已成立，一起玩耍吧🍎", param.getTitle()));
        ChatInfoDTO chatInfoDTO = chatService.createChat(param);
        return ResponseEntity.ok(Result.success(chatInfoDTO));
    }

    @DeleteMapping("/{chatId}")
    @Operation(summary = "解散聊天室")
    public ResponseEntity<Result<Void>> deleteChat(@PathVariable @Valid String chatId) {
        ChatDeleteParam chatDeleteParam = new ChatDeleteParam();
        chatDeleteParam.setChatId(chatId);
        chatDeleteParam.setOperateUserId(UserInfoHolder.id());
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
    @Operation(summary = "添加聊天室成员")
    public ResponseEntity<Result<Void>> addMember(@RequestParam String chatId,
                                                  @RequestParam String userId) {
        chatService.addMember(chatId, userId);
        return ResponseEntity.ok(Result.success());
    }

    @DeleteMapping("/members")
    @Operation(summary = "删除聊天室成员")
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

    @GetMapping("/members/{chatId}")
    @Operation(summary = "获取群聊成员列表")
    public ResponseEntity<Result<Slices<SimpleUserDTO>>> getGroupChatMembers(@PathVariable String chatId,
                                                                     @RequestParam(required = false) String lastUserId,
                                                                     @RequestParam Integer pageSize) {
        Slices<SimpleUserDTO> members = chatQueryService.getGroupChatMembers(chatId, lastUserId, pageSize);
        return ResponseEntity.ok(Result.success(members));
    }

    @GetMapping("/friendChat")
    @Operation(summary = "获取与好友的私聊ID")
    public ResponseEntity<Result<ChatInfoDTO>> getFriendChat(@RequestParam String friendUserId) {
        ChatInfoDTO chatInfo = chatQueryService.getSingleChat(UserInfoHolder.id(), friendUserId);
        return ResponseEntity.ok(Result.success(chatInfo));
    }

    @GetMapping("/groupChats")
    @Operation(summary = "获取群聊列表")
    public ResponseEntity<Result<List<String>>> groupChats() {
        List<String> groupChats = chatQueryService.getGroupChats(UserInfoHolder.id());
        return ResponseEntity.ok(Result.success(groupChats));
    }

    @GetMapping
    @Operation(summary = "查询聊天列表")
    public ResponseEntity<Result<Slices<ChatInfoDTO>>> getChatList(@RequestParam(required = false) String lastMessageId,
                                                                   @RequestParam Integer pageSize) {
        Slices<ChatInfoDTO> chatList = chatQueryService.getChatList(UserInfoHolder.id(), lastMessageId, pageSize);
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
    @Operation(summary = "标记消息已读")
    public ResponseEntity<Result<Void>> read(@RequestBody @Valid MessageReadParam param) {
        param.setUserId(UserInfoHolder.id());
        chatService.read(param);
        return ResponseEntity.ok(Result.success());
    }

    @GetMapping("ai/reply/{chatId}")
    @Operation(summary = "AI回复建议")
    public ResponseEntity<Result<String>> aiReply(@PathVariable String chatId){
        String reply = chatService.aiReply(chatId, UserInfoHolder.id());
        return ResponseEntity.ok(Result.success(reply));
    }
}
