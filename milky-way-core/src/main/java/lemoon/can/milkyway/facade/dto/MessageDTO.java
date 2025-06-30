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
    private String id;

    /**
     * 客户端消息ID
     */
    private String clientMsgId;

    /**
     * 聊天室ID
     */
    private String chatId;

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
}