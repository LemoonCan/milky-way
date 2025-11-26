package lemoon.can.milkyway.infrastructure.service.command.ai;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import lemoon.can.milkyway.facade.service.command.AiAssistantService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/10/31
 */
@Service("geminiAssistantService")
public class GeminiAssistantServiceImpl implements AiAssistantService {
    private final Client client;
    @Value("${gemini.model}")
    private String model;

    public GeminiAssistantServiceImpl(Client client) {
        this.client = client;
    }

    @Override
    public String messagesReply(List<SimpleMessageDTO> context, String imitateUser) {
        GenerateContentConfig config = GenerateContentConfig.builder()
                .temperature(0.7f)    // 可选
                .candidateCount(1)   // 可选
                .build();        // 调用模型生成文本

        List<Content> contents = new ArrayList<>();
        String systemPrompt = """
                你现在是 %s，性格幽默、偶尔调侃，发言简洁。
                请根据下面的聊天记录，生成该角色的下一条回复。
                要求：
                - 保持说话风格
                - 回复简短 1-2 句话
                - 不要重复聊天记录内容
                - 可以略带幽默但不要夸张
                """.formatted(imitateUser);
        contents.add(buildTextContent("user", systemPrompt));

        for (SimpleMessageDTO item : context) {
            contents.add(buildTextContent("user", item.getSenderOpenId() + "：" + item.getContent()));
        }
        GenerateContentResponse response = client.models.generateContent(model, contents, config);
        return response.text();
    }

    // role说明：model角色是AI历史回复的内容，user角色是用户的内容或者指令
    private Content buildTextContent(String role, String text) {
        return Content.builder()
                .role(role)
                .parts(Part.builder().text(text).build())
                .build();
    }
}

