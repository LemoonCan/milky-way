package lemoon.can.milkyway.facade.param;

import lemoon.can.milkyway.common.enums.ChatType;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/21
 */
@Data
public class ChatCreateParam implements Serializable {
    /**
     * 聊天类型
     */
    private ChatType chatType;
    /**
     * 名称
     */
    private String title;
    /**
     * 聊天室成员
     */
    private List<String> members;
    /**
     * 操作人ID
     */
    private String operateUserId;

    /**
     * 默认消息
     */
    private String defaultMessage;
}
