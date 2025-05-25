package lemoon.can.milkyway.facade.param;

import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/5/23
 */
@Data
public class ChatUpdateParam implements Serializable {
    /**
     * 聊天室ID
     */
    private String chatId;
    /**
     * 名称
     */
    private String title;
    /**
     * 公告
     */
    private String bulletin;
}
