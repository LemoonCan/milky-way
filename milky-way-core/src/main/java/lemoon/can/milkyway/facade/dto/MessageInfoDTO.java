package lemoon.can.milkyway.facade.dto;

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
     * 发送者信息
     */
    private SimpleUserDTO sender;

    /**
     * 消息内容
     */
    private MessageMetaDTO meta;
    
    /**
     * 发送时间
     */
    private String sentTime;

}