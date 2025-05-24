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
     * 聊天成员名称
     */
    private String chatNickName;
    /**
     * 备注
     */
    private String remark;
    /**
     * 免打扰
     */
    private Boolean dontDisturb;
    /**
     * 是否置顶
     */
    private Boolean top;
}
