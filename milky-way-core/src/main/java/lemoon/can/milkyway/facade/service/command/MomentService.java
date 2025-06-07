package lemoon.can.milkyway.facade.service.command;

import lemoon.can.milkyway.facade.param.CommentParam;
import lemoon.can.milkyway.facade.param.PublishParam;

/**
 * @author lemoon
 * @since 2025/6/5
 */
public interface MomentService {
    /**
     * 发布动态
     * @param param 发布参数
     */
    String publish(PublishParam param);

    /**
     * 删除动态
     * @param momentId 动态ID
     */
    void delete(String momentId);

    /**
     * 点赞
     * @param momentId 动态ID
     * @param userId 用户ID
     */
    void like(String momentId, String userId);

    /**
     * 取消点赞
     * @param momentId 动态ID
     * @param userId 用户ID
     */
    void unlike(String momentId, String userId);

    /**
     * 评论
     * @param param 评论参数
     */
    void comment(CommentParam param);
}
