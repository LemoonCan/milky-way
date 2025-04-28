package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * @author lemoon
 * @since 2025/4/28
 */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByOpenId(String openId);
}
