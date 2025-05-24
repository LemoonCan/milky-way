package lemoon.can.milkyway.controller.chat;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.param.ChatCreateParam;
import lemoon.can.milkyway.facade.service.command.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping
    @Operation(summary = "创建聊天室")
    public ResponseEntity<Result<Void>> createChat(@RequestBody @Valid ChatCreateParam param) {
        chatService.createChat(param);
        return null;
    }


}
