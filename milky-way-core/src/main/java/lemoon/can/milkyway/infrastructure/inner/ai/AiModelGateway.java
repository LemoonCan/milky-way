package lemoon.can.milkyway.infrastructure.inner.ai;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * @author lemoon
 * @since 2026/3/13
 */
public interface AiModelGateway {
    /**
     * 普通输出
     * @param input 输入参数
     * @return String
     */
    String output(AiModelInput input);

    /**
     * 流式输出
     * @param input 输入参数
     * @return SseEmitter
     */
    SseEmitter streamOutput(AiModelInput input);
}
