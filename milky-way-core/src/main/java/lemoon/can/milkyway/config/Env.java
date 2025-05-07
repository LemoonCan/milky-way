package lemoon.can.milkyway.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author lemoon
 * @since 2025/5/7
 */
@ConfigurationProperties(prefix = "env")
@Component
@Data
public class Env {
    private String domain;
    private String fileviewUrl;
}
