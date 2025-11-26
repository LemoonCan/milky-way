package lemoon.can.milkyway.controller.ai;

import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import lemoon.can.milkyway.facade.service.command.AiAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/10/31
 */
@RestController("/ai/assistant")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    @PostMapping("/replyMessage")
    public String replyMessage(@RequestBody List<SimpleMessageDTO> messages,
                               @RequestParam String imitateUser) {
        return aiAssistantService.messagesReply(messages, imitateUser);
    }
}
