package lemoon.can.milkyway.infrastructure.inner.ai;

import lombok.Data;

/**
 * @author lemoon
 * @since 2026/3/13
 */
@Data
public class AiModelInput {
    private String systemPrompt;
    private String context;
    private String userPrompt;
}
