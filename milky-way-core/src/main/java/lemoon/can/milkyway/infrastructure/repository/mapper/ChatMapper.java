package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.infrastructure.repository.dos.ChatDO;
import org.apache.ibatis.annotations.*;

/**
 * @author lemoon
 * @since 2025/5/24
 */
@Mapper
public interface ChatMapper {
    @Insert( "INSERT INTO chat(id, type, title, bulletin) VALUES(#{id}, #{type}, #{title}, #{bulletin})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    Long insert(ChatDO chatDO);

    @Select( "SELECT * FROM chat WHERE id = #{id}")
    ChatDO selectById(Long id);

    @Delete( "DELETE FROM chat WHERE id = #{id}")
    int deleteById(Long id);

    int update(ChatDO param);

}
