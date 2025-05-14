package lemoon.can.milkyway.infrastructure.repository.query;

import lemoon.can.milkyway.infrastructure.repository.dos.FriendApplicationDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Mapper
public interface FriendApplicationQueryRepository {
    List<FriendApplicationDO> findApplications(@Param("toUserId") Long toUserId);
}
