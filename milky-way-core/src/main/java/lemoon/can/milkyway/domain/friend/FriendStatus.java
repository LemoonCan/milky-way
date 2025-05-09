package lemoon.can.milkyway.domain.friend;

/**
 * @author lemoon
 * @since 2025/4/29
 */
public enum FriendStatus {
    /**
     * 申请中
     */
    APPLYING,
    /**
     * 已同意
     */
    ESTABLISHED,
    /**
     * 已拒绝
     */
    REJECTED,
    /**
     * 已删除
     */
    DELETED,
    /**
     * 被删除
     */
    DELETED_BY,
    /**
     * 已拉黑
     */
    BLACKLISTED,
    /**
     * 被拉黑
     */
    BLACKLISTED_BY,
}
