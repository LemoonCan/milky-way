package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.MessageSenderType;
import lemoon.can.milkyway.common.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageInfoDTO {
    /**
     * 消息ID
     */
    private String id;

    /**
     * 聊天室ID
     */
    private String chatId;

    /**
     * 发送者类型
     */
    private MessageSenderType senderType;

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
    private String sentTime;

    /**
     * 是否已读
     */
    private boolean read;
    
    /**
     * 阅读时间
     */
    private String readTime;
}