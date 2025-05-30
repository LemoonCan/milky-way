package lemoon.can.milkyway.domain.user.id;

import lemoon.can.milkyway.common.utils.FlexibleSnowflake;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.generator.BeforeExecutionGenerator;
import org.hibernate.generator.EventType;
import org.hibernate.generator.Generator;

import java.util.EnumSet;

/**
 * @author lemoon
 * @since 2025/5/30
 */
public class IdGenerator implements Generator, BeforeExecutionGenerator {
    private final FlexibleSnowflake snowflake = new FlexibleSnowflake("U", FlexibleSnowflake.MachineConfig.SMALL, 0);

    @Override
    public Object generate(SharedSessionContractImplementor sharedSessionContractImplementor, Object o, Object o1, EventType eventType) {
        return snowflake.nextId();
    }

    @Override
    public EnumSet<EventType> getEventTypes() {
        return EnumSet.of(EventType.INSERT);
    }
}
