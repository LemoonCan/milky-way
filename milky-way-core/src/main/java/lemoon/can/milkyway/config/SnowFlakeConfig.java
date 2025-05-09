package lemoon.can.milkyway.config;

import lemoon.can.milkyway.utils.Snowflake;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author lemoon
 * @since 2025/5/1
 */
@Configuration
public class SnowFlakeConfig {
    @Bean
    public Snowflake fileSnowFlake(){
        return new Snowflake("FI", 1);
    }
}
