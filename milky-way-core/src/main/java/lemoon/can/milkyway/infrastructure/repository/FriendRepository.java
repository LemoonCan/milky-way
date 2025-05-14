package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.friend.Friend;
import lemoon.can.milkyway.domain.friend.FriendId;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author lemoon
 * @since 2025/5/14
 */
public interface FriendRepository extends JpaRepository<Friend, FriendId> {
}
