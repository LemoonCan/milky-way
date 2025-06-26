package lemoon.can.milkyway.facade.service.query;

import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.dto.FriendDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.param.FriendsApplicationQueryParam;
import lemoon.can.milkyway.facade.param.FriendsQueryParam;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/14
 */
public interface FriendQueryService {
    /**
     * 获取好友申请列表
     *
     * @param param
     * @return 好友申请列表
     */
    Slices<FriendApplicationDTO> getApplications(FriendsApplicationQueryParam param);

    /**
     * 获取好友列表
     *
     * @param param 查询参数
     * @return
     */
    Slices<FriendDTO> getFriends(FriendsQueryParam param);

    int countFriends(String userId);
}
