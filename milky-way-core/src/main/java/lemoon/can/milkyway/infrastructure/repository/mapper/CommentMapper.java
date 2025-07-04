package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.infrastructure.repository.dos.CommentDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

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
} 