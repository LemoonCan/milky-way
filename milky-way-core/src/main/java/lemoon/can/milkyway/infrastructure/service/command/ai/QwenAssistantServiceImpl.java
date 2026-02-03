package lemoon.can.milkyway.infrastructure.service.command.ai;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.app.Application;
import com.alibaba.dashscope.app.ApplicationParam;
import com.alibaba.dashscope.app.ApplicationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.alibaba.fastjson2.JSON;
import io.reactivex.Flowable;
import io.reactivex.schedulers.Schedulers;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import lemoon.can.milkyway.facade.service.command.AiAssistantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @author lemoon
 * @since 2025/11/27
 * API调用文档 <a href="https://help.aliyun.com/zh/model-studio/qwen-api-reference"/>
 * 文生文prompt指南 <a href="https://help.aliyun.com/zh/model-studio/prompt-engineering-guide"/>
 */
@ConditionalOnProperty(name = "ai.assistant.provider", havingValue = "qwen")
@Service
@RequiredArgsConstructor
@Slf4j
public class QwenAssistantServiceImpl implements AiAssistantService {
    @Value("${qwen.api-key}")
    private String apiKey;
    @Value("${qwen.app-id}")
    private String appId;

    private final Application application;

    // 线程池用于异步处理
    private final ExecutorService executor = Executors.newCachedThreadPool();

    // SSE 超时时间（60秒）
    private static final Long SSE_TIMEOUT = 60_000L;

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
        for (SimpleMessageDTO item : contexts) {
            messages.add(item.getSenderOpenId() + "：" + item.getContent());
        }

        ApplicationParam param = ApplicationParam.builder()
                .apiKey(apiKey)
                .appId(appId)
                .prompt(systemPrompt + "\n" + JSON.toJSONString(messages))
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
    public SseEmitter streamChatReply(Long chatId, String userMessage, List<SimpleMessageDTO> conversationHistory) {
        log.info("开始 AI 流式响应: chatId={}, message={}", chatId, userMessage);

        // 1. 创建 SseEmitter
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        // 2. 设置回调
        emitter.onTimeout(() -> {
            log.warn("SSE 连接超时: chatId={}", chatId);
            emitter.complete();
        });
        emitter.onCompletion(() -> {
            log.info("SSE 连接关闭: chatId={}", chatId);
        });
        emitter.onError(error -> {
            log.error("SSE 连接错误: chatId={}", chatId, error);
        });

        executor.execute(() -> {
            try {
                // 构建消息列表
                List<Message> messages = buildMessages(conversationHistory, userMessage);

                // 构建请求参数
                GenerationParam param = GenerationParam.builder()
                        .apiKey(apiKey)
                        .model("qwen-plus")
                        .messages(messages)
                        .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                        .incrementalOutput(true) // 开启增量输出
                        .build();

                // 调用 Qwen 流式 API
                Generation gen = new Generation();
                Flowable<GenerationResult> flowable = gen.streamCall(param);

                StringBuilder fullContent = new StringBuilder();

                // 订阅流式响应
                flowable
                        .subscribeOn(Schedulers.io())
                        .observeOn(Schedulers.computation())
                        .blockingForEach(result -> {
                            // 获取内容
                            String content = result.getOutput()
                                    .getChoices().get(0)
                                    .getMessage().getContent();

                            fullContent.append(content);

                            // 发送内容块
                            sendSseEvent(emitter, "message", content);

                            // 检查是否完成
                            String finishReason = result.getOutput()
                                    .getChoices().get(0)
                                    .getFinishReason();

                            if (finishReason != null && !"null".equals(finishReason)) {
                                // 发送用量信息
                                Map<String, Object> usage = Map.of(
                                        "inputTokens", result.getUsage().getInputTokens(),
                                        "outputTokens", result.getUsage().getOutputTokens(),
                                        "totalTokens", result.getUsage().getTotalTokens()
                                );
                                sendSseEvent(emitter, "usage", usage);

                                log.info("AI 响应完成: chatId={}, tokens={}",
                                        chatId, result.getUsage().getTotalTokens());
                            }
                        });
                // 发送完成事件
                sendSseEvent(emitter, "done", Map.of(
                        "chatId", chatId,
                        "fullContent", fullContent.toString()
                ));

                // 完成 SSE 连接
                emitter.complete();

            } catch (Exception e) {
                log.error("AI 流式响应失败: chatId={}", chatId, e);

                // 发送错误事件
                try {
                    sendSseEvent(emitter, "error", Map.of(
                            "message", "AI服务异常：" + e.getMessage(),
                            "chatId", chatId
                    ));
                } catch (Exception ignored) {
                }

                emitter.completeWithError(e);
            }
        });

        // 4. 立即返回 emitter
        return emitter;
    }

    private List<Message> buildMessages(List<SimpleMessageDTO> history, String newMessage) {
        List<Message> messages = new ArrayList<>();
        String systemPrompt = """
                你是一个智能AI助手，擅长回答各类问题。
                要求：
                - 回答准确、简洁
                - 使用友好的语气
                - 支持 Markdown 格式
                - 如果不确定，诚实说明
                """;

        // 1. 系统提示词
        messages.add(Message.builder()
                .role(Role.SYSTEM.getValue())
                .content(systemPrompt)
                .build());

        // 2. 历史消息（最多保留最近10条）
        int maxHistory = 10;
        int startIndex = Math.max(0, history.size() - maxHistory);
        for (int i = startIndex; i < history.size(); i++) {
            SimpleMessageDTO msg = history.get(i);
            messages.add(Message.builder()
                    .role(Role.USER.getValue())
                    .content(msg.getContent())
                    .build());
        }

        // 3. 当前用户消息
        messages.add(Message.builder()
                .role(Role.USER.getValue())
                .content(newMessage)
                .build());

        return messages;
    }

    private void sendSseEvent(SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(data)
            );
        } catch (IOException e) {
            log.error("发送 SSE 事件失败: event={}", eventName, e);
            throw new RuntimeException(e);
        }
    }


}
