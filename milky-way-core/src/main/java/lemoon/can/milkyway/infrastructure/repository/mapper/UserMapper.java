package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.infrastructure.repository.dos.UserDO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/25
 */
@Mapper
public interface UserMapper {
    @Select( "SELECT * FROM users")
    List<UserDO> selectAll();
}
