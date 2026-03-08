package lemoon.can.milkyway.infrastructure.service.command.ai;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.TextBlock;
import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import lemoon.can.milkyway.facade.service.command.AiAssistantService;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.concurrent.DelegatingSecurityContextExecutorService;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * @author lemoon
 * @since 2026/3/4
 */
@ConditionalOnProperty(name = "ai.assistant.provider", havingValue = "claude")
@Service
@Slf4j
public class ClaudeAssistantServiceImpl implements AiAssistantService {
    @Value("${claude.api-key}")
    private String apiKey;
    @Value("${claude.base-url}")
    private String baseUrl;

    @Override
    public String messagesReply(List<SimpleMessageDTO> contexts, String imitateUser) {
        AnthropicClient client = AnthropicOkHttpClient.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .build();

        String systemPrompt = """
                你现在是 %s，性格幽默、偶尔调侃，发言简洁。
                请根据下面的聊天记录，生成该角色的下一条回复。
                要求：
                - 保持说话风格
                - 回复简短 1-2 句话
                - 不要重复聊天记录内容
                - 可以略带幽默但不要夸张
                """.formatted(imitateUser);

        List<String> messagesText = new ArrayList<>();
        for (SimpleMessageDTO item : contexts) {
            messagesText.add(item.getSenderOpenId() + "：" + item.getContent());
        }

        MessageCreateParams params = MessageCreateParams.builder()
                .model("claude-sonnet-4-6")
                .maxTokens(500L)
                .addUserMessage(systemPrompt + "\n" + JSON.toJSONString(messagesText))
                .build();

        Message message = client.messages().create(params);
        Optional<TextBlock> optional = message.content().get(0).text();
        return optional.map(TextBlock::text).orElse("");
    }

    @Override
    public SseEmitter streamReply(List<SimpleMessageDTO> context, String userPrompt) {
        SseEmitter emitter = new SseEmitter(0L);

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor = new DelegatingSecurityContextExecutorService(executor);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Runnable task = DelegatingSecurityContextRunnable.create(() -> {
            OkHttpClient httpClient = new OkHttpClient();
            try {
                String url = baseUrl + "/v1/messages";

                Map<String, Object> body = new HashMap<>();
                body.put("model", "claude-sonnet-4-6");
                body.put("max_tokens", 500);
                body.put("stream", true);

                List<Map<String, String>> messages = new ArrayList<>();

                for (SimpleMessageDTO msg : context) {
                    messages.add(Map.of(
                            "role", "user",
                            "content", msg.getContent()
                    ));
                }

                messages.add(Map.of(
                        "role", "user",
                        "content", userPrompt
                ));

                body.put("messages", messages);

                Request request = new Request.Builder()
                        .url(url)
                        .addHeader("x-api-key", apiKey)
                        .addHeader("anthropic-version", "2023-06-01")
                        .addHeader("content-type", "application/json")
                        .addHeader("accept", "text/event-stream")
                        .post(RequestBody.create(
                                JSON.toJSONString(body),
                                MediaType.parse("application/json")
                        ))
                        .build();

                Response response = httpClient.newCall(request).execute();

                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(response.body().byteStream())
                );

                String line;

                while ((line = reader.readLine()) != null) {

                    if (!line.startsWith("data:")) {
                        continue;
                    }

                    String json = line.substring(5).trim();

                    if ("[DONE]".equals(json)) {
                        break;
                    }

                    JSONObject event = JSON.parseObject(json);

                    String type = event.getString("type");

                    if ("content_block_delta".equals(type)) {

                        JSONObject delta = event.getJSONObject("delta");

                        if ("text_delta".equals(delta.getString("type"))) {

                            String text = delta.getString("text");

                            emitter.send(text);
                        }
                    }
                }

                emitter.complete();

            } catch (Exception e) {

                log.error("Claude stream error", e);

                emitter.completeWithError(e);
            }
        }, securityContext);
        executor.submit(task);

        return emitter;
    }
}
