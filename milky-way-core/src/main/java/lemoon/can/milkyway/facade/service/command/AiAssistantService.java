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
     * AI消息回复
     * @param contexts 上下文消息列表，按时间顺序排列
     * @param imitateUser 模仿用户的openId
     * @return 回复内容
     */
    String messagesReply(List<SimpleMessageDTO> contexts, String imitateUser);

    /**
     * AI消息流式响应（SSE）
     * 流式输出文档 <a href="https://help.aliyun.com/zh/model-studio/stream#1dfacd7d3d4ip"/>
     * @param context 对话历史
     * @param userPrompt 用户输入的消息
     * @return SseEmitter
     */
    default SseEmitter streamReply(List<SimpleMessageDTO> context, String userPrompt){
        return null;
    }

}