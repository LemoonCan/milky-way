package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.infrastructure.repository.dos.ChatDO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Select;
import org.mapstruct.Mapper;

/**
 * @author lemoon
 * @since 2025/5/24
 */
@Mapper
public interface ChatMapper {
    @Insert( "INSERT INTO chat(id, type, title, bulletin) VALUES(#{id}, #{type}, #{title}, #{bulletin})")
    Long insert(ChatDO chatDO);

    @Select( "SELECT * FROM chat WHERE id = #{id}")
    ChatDO selectById(Long id);
}
