package lemoon.can.milkyway.facade.service.query;

import lemoon.can.milkyway.facade.dto.ChatInfoDTO;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.dto.MessageInfoDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.param.ChatMessagesQueryParam;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/25
 */
public interface ChatQueryService {
    List<String> getGroupChats(String userId);

    /**
     * 游标分页查询聊天列表
     * @param userId 用户ID
     * @param lastId 游标，用于分页查询的起始位置，为null则从头开始
     * @param pageSize 每页数量
     * @return 聊天信息分页结果
     */
    Slices<ChatInfoDTO> getChatList(String userId, String lastMessageId, Integer pageSize);

    /**
     * 获取聊天消息列表
     * @param param 查询参数
     * @return 消息列表
     */
    Slices<MessageInfoDTO> getChatMessages(ChatMessagesQueryParam param);
}
