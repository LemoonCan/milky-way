package lemoon.can.milkyway.infrastructure.inner.ai;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/10/31
 */
@Service("geminiAiModelService")
@ConditionalOnProperty(name = "ai.model.provider", havingValue = "gemini")
public class GeminiAiModelGatewayImpl implements AiModelGateway {
    private final Client client;
    @Value("${gemini.model}")
    private String model;

    public GeminiAiModelGatewayImpl(Client client) {
        this.client = client;
    }

    @Override
    public String output(AiModelInput input) {
        GenerateContentConfig config = GenerateContentConfig.builder()
                .temperature(0.7f)
                .candidateCount(1)
                .build();

        List<Content> contents = new ArrayList<>();
        contents.add(buildTextContent("user", input.getSystemPrompt()));
        contents.add(buildTextContent("user", input.getContext()));
        GenerateContentResponse response = client.models.generateContent(model, contents, config);
        return response.text();
    }

    private Content buildTextContent(String role, String text) {
        return Content.builder()
                .role(role)
                .parts(Part.builder().text(text).build())
                .build();
    }

    @Override
    public SseEmitter streamOutput(AiModelInput input) {
        throw new BusinessException(ErrorCode.UNSUPPORTED, "当前模型暂不支持流式输出");
    }
}
