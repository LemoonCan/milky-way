package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.common.enums.ExtInfoKeyName;
import lemoon.can.milkyway.domain.ExtInfo;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

/**
 * @author lemoon
 * @since 2025/10/1
 */
public interface ExtInfoRepository extends CrudRepository<ExtInfo, String> {
    Optional<ExtInfo> findByKeyName(ExtInfoKeyName keyName);
}
