package lemoon.can.milkyway.controller.ai;

import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import lemoon.can.milkyway.facade.service.command.AiAssistantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/10/31
 */
@RestController("/ai/assistant")
@RequiredArgsConstructor
@Slf4j
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    @PostMapping("/replyMessage")
    public String replyMessage(@RequestBody List<SimpleMessageDTO> messages,
                               @RequestParam String imitateUser) {
        return aiAssistantService.messagesReply(messages, imitateUser);
    }

    @GetMapping("/stream/{chatId}")
    public SseEmitter streamChat(
            @PathVariable Long chatId,
            @RequestParam String message,
            Principal principal) {
        log.info("收到 AI 流式请求: chatId={}, user={}, message={}",
                chatId, principal.getName(), message);

        // 1. 获取历史消息（最近20条）

        // 2. 调用流式服务
        return aiAssistantService.streamChatReply(chatId, message, new ArrayList<>());
    }
}
