package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.friend.FriendApplication;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author lemoon
 * @since 2025/5/13
 */
public interface FriendApplicationRepository extends JpaRepository<FriendApplication, Long> {
}
