package lemoon.can.milkyway.infrastructure.repository.dos;

import lemoon.can.milkyway.common.enums.MessageType;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * @author lemoon
 * @since 2025/6/27
 */
@Data
public class MessageDO {
    /**
     * 消息ID
     */
    private Long id;

    /**
     * 聊天室ID
     */
    private Long chatId;

    /**
     * 发送者信息
     */
    private SimpleUserDTO sender;

    /**
     * 类型
     */
    private MessageType type;

    /**
     * 内容
     */
    private String content;

    /**
     * 发送时间
     */
    private LocalDateTime sentTime;

    /**
     * 是否已读
     */
    private boolean read;

    /**
     * 阅读时间
     */
    private LocalDateTime readTime;
}
