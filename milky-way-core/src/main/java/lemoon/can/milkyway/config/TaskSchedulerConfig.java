package lemoon.can.milkyway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;

/**
 * @author lemoon
 * @since 2025/9/28
 */
@Configuration
public class TaskSchedulerConfig implements SchedulingConfigurer {
    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        ThreadPoolTaskScheduler pool = new ThreadPoolTaskScheduler();
        pool.setPoolSize(2);
        pool.setThreadNamePrefix("sche-");
        pool.setRemoveOnCancelPolicy(true);
        pool.setWaitForTasksToCompleteOnShutdown(true);
        pool.setAwaitTerminationSeconds(60);
        pool.initialize();
        registrar.setTaskScheduler(pool);
    }
}

