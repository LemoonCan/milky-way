package lemoon.can.milkyway.controller.ai;

import lemoon.can.milkyway.infrastructure.service.command.ai.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author lemoon
 * @since 2025/10/31
 */
@RestController
@RequiredArgsConstructor
public class GeminiController {

    private final GeminiService geminiService;

    @GetMapping("/chat")
    public String chat(@RequestParam String prompt) {
        return geminiService.ask(prompt);
    }
}
