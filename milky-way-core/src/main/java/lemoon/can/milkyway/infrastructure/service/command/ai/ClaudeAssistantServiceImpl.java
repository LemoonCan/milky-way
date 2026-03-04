package lemoon.can.milkyway.infrastructure.service.command.ai;

import com.alibaba.fastjson2.JSON;
import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.TextBlock;
import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import lemoon.can.milkyway.facade.service.command.AiAssistantService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * @author lemoon
 * @since 2026/3/4
 */
@ConditionalOnProperty(name = "ai.assistant.provider", havingValue = "claude")
@Service
@Slf4j
public class ClaudeAssistantServiceImpl implements AiAssistantService {
    @Value("${claude.api-key}")
    private String apiKey;
    @Value("${claude.base-url}")
    private String baseUrl;

    @Override
    public String messagesReply(List<SimpleMessageDTO> contexts, String imitateUser) {
        AnthropicClient client = AnthropicOkHttpClient.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .build();

        String systemPrompt = """
                你现在是 %s，性格幽默、偶尔调侃，发言简洁。
                请根据下面的聊天记录，生成该角色的下一条回复。
                要求：
                - 保持说话风格
                - 回复简短 1-2 句话
                - 不要重复聊天记录内容
                - 可以略带幽默但不要夸张
                """.formatted(imitateUser);

        List<String> messagesText = new ArrayList<>();
        for (SimpleMessageDTO item : contexts) {
            messagesText.add(item.getSenderOpenId() + "：" + item.getContent());
        }

        MessageCreateParams params = MessageCreateParams.builder()
                .model("claude-sonnet-4-6")
                .maxTokens(500L)
                .addUserMessage(systemPrompt + "\n" + JSON.toJSONString(messagesText))
                .build();

        Message message = client.messages().create(params);
        Optional<TextBlock> optional = message.content().get(0).text();
        return optional.map(TextBlock::text).orElse("");
    }
}
