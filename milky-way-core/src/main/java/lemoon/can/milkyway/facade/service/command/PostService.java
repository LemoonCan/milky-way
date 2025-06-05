package lemoon.can.milkyway.facade.service.command;

import lemoon.can.milkyway.facade.param.CommentParam;
import lemoon.can.milkyway.facade.param.PublishParam;

/**
 * @author lemoon
 * @since 2025/6/5
 */
public interface PostService {
    /**
     * 发布帖子
     * @param param 发布参数
     */
    String publish(PublishParam param);

    /**
     * 删除帖子
     * @param postId 帖子ID
     */
    void delete(String postId);

    /**
     * 点赞
     * @param postId 帖子ID
     * @param userId 用户ID
     */
    void like(String postId, String userId);

    /**
     * 取消点赞
     * @param postId 帖子ID
     * @param userId 用户ID
     */
    void unlike(String postId, String userId);

    /**
     * 评论
     * @param param 评论参数
     */
    String comment(CommentParam param);
}
