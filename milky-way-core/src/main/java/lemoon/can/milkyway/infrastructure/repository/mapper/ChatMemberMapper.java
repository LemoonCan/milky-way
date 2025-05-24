package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.infrastructure.repository.dos.ChatMemberDO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/24
 */
@Mapper
public interface ChatMemberMapper {
    @Insert( "INSERT INTO chat_member(chat_id, user_id) VALUES(#{chatId}, #{userId})")
    Long insert(ChatMemberDO chatMemberDO);

    void batchInsert(List<ChatMemberDO> chatMemberDOList);

    @Select("SELECT * FROM chat_member WHERE chat_id = #{chatId}")
    List<ChatMemberDO> selectByChatId(Long chatId);
}
