package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.infrastructure.repository.dos.MomentDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/6/5
 */
@Mapper
public interface MomentMapper {
    /**
     * 查询好友动态
     *
     * @param userId 用户ID
     * @param lastId 分页游标（取 < lastId 的 20 条）
     * @return 20 条动态及作者信息
     */
    List<MomentDO> listFriendMoments(@Param("userId") String userId,
                                     @Param("lastId") Long lastId,
                                     @Param("pageSize") int pageSize);

    /**
     * 查询个人动态
     *
     * @param userId 用户ID
     * @param lastId 分页游标（取 < lastId 的 20 条）
     * @return 20 条动态及作者信息
     */
    List<MomentDO> listPersonalMoments(@Param("userId") String userId,
                                     @Param("lastId") Long lastId,
                                     @Param("pageSize") int pageSize);


    @Select("SELECT publish_user_id FROM moment WHERE id = #{id}")
    String selectPublishUserIdById(@Param("id") Long id);

    @Select("SELECT id, content_type, text, medias FROM moment WHERE publish_user_id = #{publishUserId} order by id desc limit 1")
    MomentDO selectLastMomentByPublishUserId(String publishUserId);
}
