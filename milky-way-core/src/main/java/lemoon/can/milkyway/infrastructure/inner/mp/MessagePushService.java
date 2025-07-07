package lemoon.can.milkyway.infrastructure.inner.mp;

import lemoon.can.milkyway.domain.friend.FriendApplication;
import lemoon.can.milkyway.domain.share.Comment;
import lemoon.can.milkyway.domain.share.Like;
import lemoon.can.milkyway.domain.share.Moment;
import lemoon.can.milkyway.facade.dto.UnlikeDTO;

/**
 * @author lemoon
 * @since 2025/5/21
 */
public interface MessagePushService {
    /**
     * 好友申请
     *
     * @param friendApplication 好友申请对象
     */
    void friendApplyMsg(FriendApplication friendApplication);

    /**
     * 动态消息
     *
     * @param moment
     */
    void momentCreateMsg(Moment moment);

    /**
     * 动态删除消息
     *
     * @param momentId 动态ID
     */
    void momentDeleteMsg(String momentId, String publishUserId);

    /**
     * 点赞消息
     *
     * @param like 点赞对象
     */
    void likeMsg(Like like);

    /**
     * 取消点赞消息
     *
     * @param unlikeDTO 取消点赞信息
     */
    void unlikeMsg(UnlikeDTO unlikeDTO);

    /**
     * 评论消息
     *
     * @param comment 评论对象
     */
    void commentMsg(Comment comment);
}
