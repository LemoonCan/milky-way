package lemoon.can.milkyway.infrastructure.inner.ai;

import com.alibaba.dashscope.app.Application;
import com.alibaba.dashscope.app.ApplicationParam;
import com.alibaba.dashscope.app.ApplicationResult;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * @author lemoon
 * @since 2025/11/27
 * API调用文档 <a href="https://help.aliyun.com/zh/model-studio/qwen-api-reference"/>
 * 文生文prompt指南 <a href="https://help.aliyun.com/zh/model-studio/prompt-engineering-guide"/>
 */
@ConditionalOnProperty(name = "ai.model.provider", havingValue = "qwen")
@Service
@RequiredArgsConstructor
@Slf4j
public class QwenAiModelGatewayImpl implements AiModelGateway {
    @Value("${qwen.api-key}")
    private String apiKey;
    @Value("${qwen.app-id}")
    private String appId;

    private final Application application;

    @Override
    public String output(AiModelInput input) {
        ApplicationParam param = ApplicationParam.builder()
                .apiKey(apiKey)
                .appId(appId)
                .prompt(input.getSystemPrompt() + "\n" + input.getContext())
                .build();

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

    @Override
    public SseEmitter streamOutput(AiModelInput input) {
        throw new BusinessException(ErrorCode.UNSUPPORTED, "当前模型暂不支持流式输出");
    }
}
