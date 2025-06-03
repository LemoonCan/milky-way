package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.share.Like;
import lemoon.can.milkyway.domain.share.LikeId;
import org.springframework.data.repository.CrudRepository;

/**
 * @author lemoon
 * @since 2025/6/3
 */
public interface LikeRepository extends CrudRepository<Like, LikeId> {
}
