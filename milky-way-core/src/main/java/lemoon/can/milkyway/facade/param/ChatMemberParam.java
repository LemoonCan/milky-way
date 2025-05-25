package lemoon.can.milkyway.facade.param;

import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/5/23
 */
@Data
public class ChatMemberParam implements Serializable {
    /**
     * 聊天成员ID
     */
    private String userId;
    /**
     * 聊天室ID
     */
    private String chatId;
    /**
     * 备注
     */
    private String chatRemark;
    /**
     * 聊天成员名称
     */
    private String chatNickName;
    /**
     * 免打扰
     */
    private Boolean mute;
    /**
     * 是否置顶
     */
    private Boolean top;
}
