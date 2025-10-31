package lemoon.can.milkyway.infrastructure.service.command.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

/**
 * @author lemoon
 * @since 2025/10/31
 */
@Service
@RequiredArgsConstructor
public class GeminiChatService {
    private final ChatModel chatModel;

    public String ask(String prompt) {
        return chatModel.call(new Prompt(prompt)).getResult().toString();
    }
}
