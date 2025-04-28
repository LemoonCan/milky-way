package lemoon.can.milkyway.config.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/3/23
 */
@Component
@ConfigurationProperties(prefix = "security")
@Data
public class SecurityProperties {
    private List<String> permitUrls;
    private CorsProperties cors;

    @Data
    public static class CorsProperties {
        private List<String> allowedOrigins;
    }
}
