package lemoon.can.milkyway.facade.service.query;

import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.dto.FriendDTO;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/14
 */
public interface FriendQueryService {
    /**
     * 获取好友申请列表
     *
     * @param toUserOpenId 接收者的 OpenId
     * @return 好友申请列表
     */
    List<FriendApplicationDTO> getApplications(String toUserOpenId);

    /**
     * 获取好友列表
     * @param openId
     * @return
     */
    List<FriendDTO> getFriends(String openId);
}
