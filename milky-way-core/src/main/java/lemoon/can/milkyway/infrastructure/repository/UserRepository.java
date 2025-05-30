package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

/**
 * @author lemoon
 * @since 2025/4/28
 */
public interface UserRepository extends JpaRepository<User, String> {
    @Query("SELECT u.id FROM users u WHERE u.openId = :openId")
    Long findIdByOpenId(String openId);
    Optional<User> findByOpenId(String openId);
    Optional<User> findByPhone(String phone);
}
