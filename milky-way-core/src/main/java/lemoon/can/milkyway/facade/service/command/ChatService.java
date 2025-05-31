package lemoon.can.milkyway.facade.service.command;

import lemoon.can.milkyway.facade.dto.ChatDTO;
import lemoon.can.milkyway.facade.param.ChatCreateParam;
import lemoon.can.milkyway.facade.param.ChatDeleteParam;
import lemoon.can.milkyway.facade.param.ChatMemberParam;
import lemoon.can.milkyway.facade.param.ChatUpdateParam;

/**
 * @author lemoon
 * @since 2025/5/21
 */
public interface ChatService {
    /**
     * 创建聊天室
     * @param param 创建参数
     */
    ChatDTO createChat(ChatCreateParam param);

    /**
     * 删除聊天室
     * @param param 删除参数
     */
    void deleteChat(ChatDeleteParam param);

    /**
     * 更新聊天室信息
     * @param param 更新参数
     */
    void updateChat(ChatUpdateParam param);

    /**
     * 添加成员
     * @param chatId 聊天室id
     * @param userId 用户id
     */
    void addMember(String chatId, String userId);

    /**
     * 删除成员
     * @param chatId 聊天室id
     * @param userId 用户id
     */
    void deleteMember(String chatId, String userId);

    /**
     * 成员更新信息
     * @param param
     */
    void updateMemerInfo(ChatMemberParam param);
}
