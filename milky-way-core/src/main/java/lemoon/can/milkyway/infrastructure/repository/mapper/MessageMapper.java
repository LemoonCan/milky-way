package lemoon.can.milkyway.infrastructure.repository.mapper;

import lemoon.can.milkyway.infrastructure.repository.dos.MessageDO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/6/27
 */
@Mapper
public interface MessageMapper {
    /**
     * 根据聊天ID和最后一条消息ID分页查询消息列表
     *
     * @param chatId  聊天ID
     * @param before  上一条消息ID，作为分页的起点
     * @param pageSize 每页消息数量
     * @return 消息列表
     */
    List<MessageDO> getMessagesBefore(Long chatId, Long before, int pageSize);

    /**
     * 根据聊天ID和第一条消息ID分页查询消息列表
     *
     * @param chatId  聊天ID
     * @param after   第一条消息ID，作为分页的起点
     * @param pageSize 每页消息数量
     * @return 消息列表
     */
    List<MessageDO> getMessagesAfter(Long chatId, Long after, int pageSize);
}
