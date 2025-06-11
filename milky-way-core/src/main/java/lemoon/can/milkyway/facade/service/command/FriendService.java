package lemoon.can.milkyway.facade.service.command;

import lemoon.can.milkyway.facade.param.FriendApplyHandleParam;
import lemoon.can.milkyway.facade.param.FriendApplyParam;
import lemoon.can.milkyway.facade.param.FriendOperateParam;

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

    /**
     * 删除好友
     *
     * @param param 好友操作参数
     */
    void deleteFriend(FriendOperateParam param);

    /**
     * 拉黑好友
     * @param param
     */
    void blockFriend(FriendOperateParam param);

    /**
     * 解除好友拉黑
     * @param param
     */
    void unblockFriend(FriendOperateParam param);
}
