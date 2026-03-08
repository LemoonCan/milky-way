package lemoon.can.milkyway.controller.ai;

import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import lemoon.can.milkyway.facade.service.command.AiAssistantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/10/31
 */
@RestController
@RequestMapping("/ai/assistant")
@RequiredArgsConstructor
@Slf4j
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    @PostMapping("/replyMessage")
    public String replyMessage(@RequestBody List<SimpleMessageDTO> messages,
                               @RequestParam String imitateUser) {
        return aiAssistantService.messagesReply(messages, imitateUser);
    }

    @GetMapping("/stream")
    public SseEmitter streamReply(@RequestParam String message) {
        SseEmitter emitter = aiAssistantService.streamReply(new ArrayList<>(), message);
        emitter.onCompletion(() -> log.info("[AI SSE] 完成: message={}", message));
        emitter.onTimeout(() -> {
            log.warn("[AI SSE] 超时: message={}", message);
            emitter.complete();
        });
        emitter.onError(e -> log.error("[AI SSE] 出错: message={}", message));

        return emitter;
    }
}
