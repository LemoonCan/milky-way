package lemoon.can.milkyway;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableConfigurationProperties
@EnableJpaRepositories
@MapperScan("lemoon.can.milkyway.infrastructure.repository.query")
public class MilkyWayApplication {

    public static void main(String[] args) {
        SpringApplication.run(MilkyWayApplication.class, args);
    }

}
