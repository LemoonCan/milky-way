package lemoon.can.milkyway.infrastructure.inner;

/**
 * @author lemoon
 * @since 2025/5/21
 */
public interface MessagePushService {
    void pushFriendApplyMsg();
    void pushChatCreateMsg();
    void pushChatMsg();
}
