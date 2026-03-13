package lemoon.can.milkyway.infrastructure.inner.ai;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.ContentBlock;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.TextBlock;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.concurrent.DelegatingSecurityContextExecutorService;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
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
@ConditionalOnProperty(name = "ai.model.provider", havingValue = "claude")
@Service
@Slf4j
public class ClaudeAiModelGatewayImpl implements AiModelGateway {
    @Value("${claude.api-key}")
    private String apiKey;
    @Value("${claude.base-url}")
    private String baseUrl;
    @Value("${claude.model}")
    private String model;

    @Override
    public String output(AiModelInput input) {
        AnthropicClient client = AnthropicOkHttpClient.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .build();

        MessageCreateParams params = MessageCreateParams.builder()
                .model(model)
                .maxTokens(500L)
                .addUserMessage(input.getSystemPrompt() + "\n" + input.getContext())
                .build();

        Message message = client.messages().create(params);
        List<ContentBlock> contentBlockList = message.content();
        if(CollectionUtils.isEmpty(contentBlockList)) {
            return "";
        }
        StringBuilder replyText = new StringBuilder();
        for (ContentBlock contentBlock : contentBlockList) {
            contentBlock.text().map(TextBlock::text).ifPresent(replyText::append);
        }
        return replyText.toString();
    }

    @Override
    public SseEmitter streamOutput(AiModelInput input) {
        SseEmitter emitter = new SseEmitter(0L);

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor = new DelegatingSecurityContextExecutorService(executor);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Runnable task = DelegatingSecurityContextRunnable.create(() -> {
            OkHttpClient httpClient = new OkHttpClient();
            try {
                String url = baseUrl + "/v1/messages";

                Map<String, Object> body = new HashMap<>();
                body.put("model", model);
                body.put("max_tokens", 500);
                body.put("stream", true);

                List<Map<String, String>> messages = new ArrayList<>();

                if (input.getContext() != null && !input.getContext().isBlank()) {
                    messages.add(Map.of(
                            "role", "user",
                            "content", input.getContext()
                    ));
                }

                messages.add(Map.of(
                        "role", "user",
                        "content", input.getUserPrompt()
                ));

                body.put("messages", messages);

                Request httpRequest = new Request.Builder()
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

                Response response = httpClient.newCall(httpRequest).execute();

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
                            emitter.send(SseEmitter.event().data(text).reconnectTime(0));
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
