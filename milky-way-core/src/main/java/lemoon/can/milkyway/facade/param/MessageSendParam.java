package lemoon.can.milkyway.facade.param;

import lemoon.can.milkyway.common.enums.MessageType;
import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@Data
public class MessageSendParam {
    /**
     * 客户端消息ID
     */
    private String clientMsgId;
    /**
     * 发送者用户id
     */
    private String senderUserId;
    /**
     * 聊天室id
     */
    private String chatId;
    /**
     * 聊天类型
     */
    private MessageType messageType;
    /**
     * 文字 具体内容
     * 其他 url
     */
    private String content;
}