package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.facade.dto.UserDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 点赞Mapper
 * @author lemoon
 * @since 2025/6/5
 */
@Mapper
public interface LikeMapper {
    /**
     * 查询动态的点赞用户信息
     *
     * @param momentId 动态ID
     * @return 点赞用户信息列表
     */
    List<UserDTO> selectLikeUsers(@Param("momentId") Long momentId);
} 