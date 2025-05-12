package lemoon.can.milkyway.facade.service;

import lemoon.can.milkyway.facade.param.FriendApplyHandleParam;
import lemoon.can.milkyway.facade.param.FriendApplyParam;

/**
 * @author lemoon
 * @since 2025/5/12
 */
public interface FriendService {
    /**
     * 添加好友
     *
     * @param param 好友添加参数
     */
    void addFriend(FriendApplyParam param);

    /**
     * 处理好友请求
     *
     * @param param 好友请求参数
     */
    void handleApplication(FriendApplyHandleParam param);
}
