package lemoon.can.milkyway.facade.service.command;

import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/11/26
 */
public interface AiAssistantService {
    /**
     * AI模仿用户回复
     * @param contexts 上下文消息列表，按时间顺序排列
     * @param imitateUser 模仿用户的openId
     * @return 回复内容
     */
    String imitateUserReply(List<SimpleMessageDTO> contexts, String imitateUser);

    /**
     * AI好友问答
     * @param context 对话历史
     * @param userPrompt 用户输入的消息
     * @return SseEmitter
     */
    SseEmitter friendReply(List<SimpleMessageDTO> context, String userPrompt);

}