package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.infrastructure.repository.dos.ChatMemberDO;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/24
 */
@Mapper
public interface ChatMemberMapper {
    @Insert("INSERT INTO chat_member(chat_id, user_id) VALUES(#{chatId}, #{userId})")
    void insert(ChatMemberDO chatMemberDO);

    void batchInsert(List<ChatMemberDO> chatMemberDOList);

    @Select("SELECT COUNT(1) FROM chat_member WHERE chat_id = #{chatId} AND user_id = #{userId}")
    int exists(Long chatId, String userId);

    @Select("SELECT * FROM chat_member WHERE chat_id = #{chatId}")
    List<ChatMemberDO> selectByChatId(Long chatId);

    @Select("select user_id from chat_member where chat_id = #{chatId}")
    List<String> selectMemberUserIdsByChatId(Long chatId);

    @Delete("DELETE FROM chat_member WHERE chat_id = #{chatId}")
    int deleteByChatId(Long chatId);

    @Delete("DELETE FROM chat_member WHERE chat_id = #{chatId} AND user_id = #{userId}")
    int deleteByChatIdAndUserId(@Param("chatId") Long chatId, @Param("userId") String userId);

    void update(ChatMemberDO chatMemberDO);
}
