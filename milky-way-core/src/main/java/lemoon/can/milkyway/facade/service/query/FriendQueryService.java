package lemoon.can.milkyway.facade.service.query;

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
    Object getApplications(String toUserOpenId);
}
