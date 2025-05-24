package lemoon.can.milkyway.infrastructure.repository.dos;

import lemoon.can.milkyway.common.enums.ChatType;
import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/24
 */
@Data
public class ChatDO {
    /**
     * 聊天室ID
     */
    private Long id;
    /**
     * 聊天室类型
     */
    private ChatType type;
    /**
     * 聊天室标题
     */
    private String title;
    /**
     * 聊天室公告
     */
    private String bulletin;
}
