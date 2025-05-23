package lemoon.can.milkyway.facade.param;

import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/5/23
 */
@Data
public class ChatDeleteParam implements Serializable {
    /**
     * 聊天室ID
     */
    private String chatId;
    /**
     * 操作人ID
     */
    private String operateUserId;
}
