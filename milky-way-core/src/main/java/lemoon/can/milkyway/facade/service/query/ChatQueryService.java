package lemoon.can.milkyway.facade.service.query;

import lemoon.can.milkyway.facade.dto.ChatInfoDTO;
import lemoon.can.milkyway.facade.dto.MessageInfoDTO;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.param.ChatMessagesQueryParam;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/25
 */
public interface ChatQueryService {
    /**
     * 获取两个用户之间的私聊ID
     * @param userId 用户ID
     * @param friendUserId 朋友用户ID
     * @return 私聊ID，如果不存在则返回null
     */
    ChatInfoDTO getSingleChat(String userId, String friendUserId);

    /**
     * 获取用户所在的群聊ID列表
     * @param userId 用户ID
     * @return 群聊ID列表
     */
    List<String> getGroupChats(String userId);

    /**
     * 游标分页查询聊天列表
     * @param userId 用户ID
     * @param lastMessageId 游标，用于分页查询的起始位置，为null则从头开始
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

    /**
     * 获取群聊信息
     * @param chatId 聊天室ID
     * @return 聊天室信息
     */
    ChatInfoDTO getGroupChatInfo(String chatId);

    /**
     * 获取聊天室成员列表
     * @param chatId 聊天室ID
     * @param lastUserId 游标，用于分页查询的起始位置，为null则从头开始
     * @param pageSize 每页数量
     * @return 成员信息分页结果
     */
    Slices<SimpleUserDTO> getGroupChatMembers(String chatId, String lastUserId, Integer pageSize);
}
