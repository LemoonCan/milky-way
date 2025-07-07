package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
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

    @Select("select id, open_id, nick_name, avatar,nick_name_first_letter from users where id= #{id}")
    SimpleUserDTO selectSimpleById(String id);

    @Select("select id, open_id, phone, nick_name, avatar, individual_signature, register_time from users where id = #{id}")
    UserDO selectUserById(String id);

    @Select("select id, open_id, phone, nick_name, avatar, individual_signature, register_time from users where open_id = #{openId}")
    UserDO selectUserByOpenId(String openId);

    @Select("select id, open_id, phone, nick_name, avatar, individual_signature, register_time from users where phone = #{phone}")
    UserDO selectUserByPhone(String phone);
}
