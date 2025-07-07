package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.infrastructure.repository.dos.CommentDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 评论Mapper
 * @author lemoon
 * @since 2025/6/5
 */
@Mapper
public interface CommentMapper {
    /**
     * 查询动态的评论信息（包含回复）
     *
     * @param momentId 动态ID
     * @return 评论信息列表
     */
    List<CommentDO> selectComments(@Param("momentId") Long momentId);

    /**
     * 查询动态的评论信息(简单升序)
     *
     * @param momentId 动态ID
     * @return 评论信息列表
     */
    List<CommentDO> simpleSelectComments(@Param("momentId") Long momentId);

    /**
     * 查询评论用户信息
     *
     * @param commentId 评论ID
     * @return 用户信息
     */
    @Select("select u.id as id, u.nick_name as nick_name, u.avatar as avatar " +
            "from comment c " +
            "join users u on c.comment_user_id = u.id " +
            "where c.id = #{commentId}")
    SimpleUserDTO selectReplyUser(@Param("commentId") Long commentId);
} 