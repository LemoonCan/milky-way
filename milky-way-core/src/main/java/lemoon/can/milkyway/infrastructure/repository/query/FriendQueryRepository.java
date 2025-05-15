package lemoon.can.milkyway.infrastructure.repository.query;

import lemoon.can.milkyway.infrastructure.repository.dos.FriendApplicationDO;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Mapper
public interface FriendQueryRepository {
    List<FriendApplicationDO> findApplications(@Param("toUserId") Long toUserId);

    List<FriendDO> findFriends(@Param("userId") Long userId);
}
