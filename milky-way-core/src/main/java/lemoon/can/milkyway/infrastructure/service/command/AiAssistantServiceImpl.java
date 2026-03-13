package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import lemoon.can.milkyway.facade.service.command.AiAssistantService;
import lemoon.can.milkyway.infrastructure.inner.ai.AiModelGateway;
import lemoon.can.milkyway.infrastructure.inner.ai.AiModelInput;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author lemoon
 * @since 2026/3/13
 */
@Service
@RequiredArgsConstructor
public class AiAssistantServiceImpl implements AiAssistantService {
    private final AiModelGateway aiModelGateway;

    @Override
    public String imitateUserReply(List<SimpleMessageDTO> contexts, String imitateUser) {
        AiModelInput request = new AiModelInput();
        request.setSystemPrompt(buildReplySystemPrompt(imitateUser));
        request.setContext(buildContextText(contexts));
        return aiModelGateway.output(request);
    }

    @Override
    public SseEmitter friendReply(List<SimpleMessageDTO> context, String userPrompt) {
        AiModelInput request = new AiModelInput();
        request.setContext(buildContextText(context));
        request.setUserPrompt(userPrompt);
        return aiModelGateway.streamOutput(request);
    }

    private String buildReplySystemPrompt(String imitateUser) {
        return """
                你现在是 %s，性格幽默、偶尔调侃，发言简洁。
                请根据下面的聊天记录，生成该角色的下一条回复。
                要求：
                - 保持说话风格
                - 回复简短 1-2 句话
                - 不要重复聊天记录内容
                - 可以略带幽默但不要夸张
                """.formatted(imitateUser);
    }

    private String buildContextText(List<SimpleMessageDTO> contexts) {
        return contexts.stream()
                .map(item -> item.getSenderOpenId() + "：" + item.getContent())
                .collect(Collectors.joining("\n"));
    }
}
