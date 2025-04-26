package lemoon.can.milkyway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;

/**
 * @author lemoon
 * @since 2025/4/26
 */
public class OpenApiConfigure {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API 文档")
                        .version("1.0.0")
                        .description("Spring Boot 3.x + OpenAPI"));
    }
}
