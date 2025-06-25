package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.infrastructure.repository.dos.FriendApplicationDO;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Mapper
public interface FriendMapper {
    List<FriendApplicationDO> findApplications(String toUserId, Long lastId, int pageSize);

    /**
     * 查询好友
     * @param userId 用户ID
     * @param lastLetter 上个昵称首字母（用于分页）
     * @param lastNickName 上个昵称（用于分页）
     * @param pageSize 每页大小
     * @return 好友列表
     */
    List<FriendDO> findFriends(String userId, Character lastLetter, String lastNickName, int pageSize);

}
