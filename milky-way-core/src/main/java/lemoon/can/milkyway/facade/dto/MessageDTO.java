package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
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
    private UserDTO sender;

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