package lemoon.can.milkyway.infrastructure.inner.mp;

import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.domain.friend.FriendApplication;
import lemoon.can.milkyway.domain.share.Comment;
import lemoon.can.milkyway.domain.share.Like;
import lemoon.can.milkyway.domain.share.Moment;

/**
 * @author lemoon
 * @since 2025/5/21
 */
public interface MessagePushService {
    /**
     * 好友申请
     * @param friendApplication 好友申请对象
     */
    void friendApplyMsg(FriendApplication friendApplication);

    /**
     * 动态消息
     * @param moment
     */
    void momentMsg(Moment moment);

    /**
     * 点赞消息
     * @param like 点赞对象
     */
    void likeMsg(Like like);

    /**
     * 评论消息
     * @param comment 评论对象
     */
    void commentMsg(Comment comment);
}
