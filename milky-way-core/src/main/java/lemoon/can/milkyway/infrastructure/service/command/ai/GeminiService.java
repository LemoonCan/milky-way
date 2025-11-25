package lemoon.can.milkyway.infrastructure.service.command.ai;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * @author lemoon
 * @since 2025/10/31
 */
@Service
public class GeminiService {
    private final Client client;
    @Value("${gemini.model}")
    private String model;

    public GeminiService(Client client) {
        this.client = client;
    }

    public String ask(String prompt) {
        GenerateContentConfig config = GenerateContentConfig.builder()
                .temperature(0.7f)    // 可选
                .candidateCount(1)   // 可选
                .build();        // 调用模型生成文本
        GenerateContentResponse response = client.models.generateContent(model, prompt, config);
        return response.text();
    }
}

