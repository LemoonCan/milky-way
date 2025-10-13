package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.common.enums.ChatType;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatDO;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatInfoDO;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/24
 */
@Mapper
public interface ChatMapper {
    @Select("SELECT COUNT(*)>0 FROM chat WHERE id = #{id}")
    boolean existsById(Long id);

    @Insert("INSERT INTO chat(id, type, title, bulletin,extra_info) VALUES(#{id}, #{type}, #{title}, #{bulletin}, #{extraInfo})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    Long insert(ChatDO chatDO);

    @Select("SELECT * FROM chat WHERE id = #{id}")
    ChatDO selectById(Long id);

    @Delete("DELETE FROM chat WHERE id = #{id}")
    int deleteById(Long id);

    int update(ChatDO param);

    @Select("SELECT type FROM chat WHERE id = #{id}")
    ChatType selectTypeById(Long id);

    ChatInfoDO findSingleChat(String userId, String friendUserId);

    List<Long> findGroupChats(String userId);

    /**
     * 游标分页查询聊天列表
     *
     * @param userId   用户ID
     * @param lastMessageId   游标，用于分页查询的起始位置，为null则从头开始
     * @param pageSize 每页数量
     * @return 聊天信息列表
     */
    List<ChatInfoDO> findChatsByUserId(@Param("userId") String userId,
                                       @Param("lastMessageId") Long lastMessageId,
                                       @Param("pageSize") int pageSize);

    /**
     * 根据ID查询聊天信息
     * @param id
     * @return 聊天信息
     */
    ChatInfoDO selectChatInfoById(Long id);

    @Select("select id from chat " +
            "where type='single' " +
            "and id in(select chat_id from chat_member where user_id in(#{userId1}, #{userId2}) group by chat_id having count(*)=2)")
    List<Long> selectSingleChatIdByMember(String userId1, String userId2);

    @Select("SELECT id,title,bulletin,extra_info FROM chat WHERE id = #{id} AND type = 'group'")
    ChatDO selectGroupChatInfo(Long id);

    @Select("SELECT u.id, u.open_id, u.nick_name, u.nick_name_first_letter, u.avatar " +
            "FROM chat_member cm " +
            "JOIN users u ON cm.user_id = u.id " +
            "WHERE cm.chat_id = #{chatId} " +
            "AND (#{lastUserId} IS NULL OR cm.user_id > #{lastUserId}) " +
            "LIMIT #{pageSize}")
    List<SimpleUserDTO> findChatMembers(@Param("chatId") String chatId,
                                        @Param("lastUserId") String lastUserId,
                                        @Param("pageSize") Integer pageSize);
}
