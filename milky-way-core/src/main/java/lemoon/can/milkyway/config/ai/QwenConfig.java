package lemoon.can.milkyway.config.ai;

import com.alibaba.dashscope.app.Application;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author lemoon
 * @since 2025/12/7
 */
@Configuration
@ConditionalOnProperty(name = "ai.assistant.provider", havingValue = "qwen")
public class QwenConfig {
    @Bean
    public Application getQwenApplication() {
        return new Application();
    }
}
