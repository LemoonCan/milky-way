package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/6/29
 */
@Data
public class MessageReadParam implements Serializable {
    private String userId;
    @NotBlank(message = "聊天ID不能为空")
    private String chatId;
    /**
     * 最新已读消息ID
     */
    @NotBlank(message = "消息ID不能为空")
    private String messageId;
}
