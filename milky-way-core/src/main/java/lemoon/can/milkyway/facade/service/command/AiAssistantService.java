package lemoon.can.milkyway.facade.service.command;

import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/11/26
 */
public interface AiAssistantService {
    /**
     * AI消息回复
     * @param contexts 上下文消息列表，按时间顺序排列
     * @param imitateUser 模仿用户的openId
     * @return 回复内容
     */
    String messagesReply(List<SimpleMessageDTO> contexts, String imitateUser);
}
