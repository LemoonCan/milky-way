package lemoon.can.milkyway.config.properties;

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
    private List<String> getPermitUrls;
    private CorsProperties cors;

    private WebSocketProperties websocket;

    @Data
    public static class CorsProperties {
        private List<String> allowedOrigins;
    }

    @Data
    public static class WebSocketProperties {
        private String[] corsAllowedOrigins;
    }
}
