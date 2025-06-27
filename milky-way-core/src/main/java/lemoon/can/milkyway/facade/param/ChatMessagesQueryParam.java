package lemoon.can.milkyway.facade.param;

import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/6/27
 */
@Data
public class ChatMessagesQueryParam implements Serializable {
    /**
     * 聊天ID
     */
    private String chatId;
    /**
     * 分页游标，查询在此ID之前的消息
     */
    private String before;
    /**
     * 分页游标，查询在此ID之后的消息
     */
    private String after;
    /**
     * 每页大小
     */
    private Integer pageSize;

    /**
     * 操作者用户ID
     */
    private String operatorUserId;
}
