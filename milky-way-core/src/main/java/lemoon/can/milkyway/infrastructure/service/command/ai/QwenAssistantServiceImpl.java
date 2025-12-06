package lemoon.can.milkyway.infrastructure.service.command.ai;

import com.alibaba.dashscope.app.Application;
import com.alibaba.dashscope.app.ApplicationParam;
import com.alibaba.dashscope.app.ApplicationResult;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.fastjson2.JSON;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import lemoon.can.milkyway.facade.service.command.AiAssistantService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/11/27
 * API调用文档 https://help.aliyun.com/zh/model-studio/qwen-api-reference
 * 文生文prompt指南 https://help.aliyun.com/zh/model-studio/prompt-engineering-guide
 */
@Service
@ConditionalOnProperty(name = "ai.assistant.provider", havingValue = "qwen")
@Slf4j
public class QwenAssistantServiceImpl implements AiAssistantService {
    @Value("${qwen.api-key}")
    private String apiKey;
    @Value("${qwen.app-id}")
    private String appId;

    @Override
    public String messagesReply(List<SimpleMessageDTO> contexts, String imitateUser) {
        // 1. 构造系统提示词 + 聊天上下文
        String systemPrompt = """
                你现在是 %s，性格幽默、偶尔调侃，发言简洁。
                请根据我给的聊天记录，生成该角色的下一条回复。
                要求：
                - 保持说话风格
                - 回复简短1句话
                - 不要重复聊天记录内容
                - 可以略带幽默但不要夸张
                - 只给回复内容，不要带任何多余信息
                """.formatted(imitateUser);

        List<String> messages = new ArrayList<>();
        for( SimpleMessageDTO item : contexts) {
            messages.add(item.getSenderOpenId()+"："+item.getContent());
        }

        ApplicationParam param = ApplicationParam.builder()
                .apiKey(apiKey)
                .appId(appId)
                .prompt(systemPrompt+"\n" + JSON.toJSONString(messages))
                .build();

        Application application = new Application();
        try {
            ApplicationResult result = application.call(param);
            return result.getOutput().getText();
        } catch (NoApiKeyException e) {
            log.error("Qwen API Key 未配置", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR);
        } catch (InputRequiredException e) {
            log.error("Qwen 输入参数错误", e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR);
        }
    }
}
