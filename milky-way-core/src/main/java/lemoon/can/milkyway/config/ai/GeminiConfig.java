package lemoon.can.milkyway.config.ai;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author lemoon
 * @since 2025/11/25
 */
@Configuration
@ConditionalOnProperty(name = "ai.assistant.provider", havingValue = "gemini")
public class GeminiConfig {
    @Value("${gemini.api-key}")
    private String apiKey;

    @Bean
    public Client genAiClient() {
        // 构造 client，可以设置 API Key
        return Client.builder()
                .apiKey(apiKey)
                .build();
    }
}
