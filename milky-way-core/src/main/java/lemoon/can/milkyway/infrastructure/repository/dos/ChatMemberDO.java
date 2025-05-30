package lemoon.can.milkyway.infrastructure.repository.dos;

import lombok.Data;

/**
 * @author lemoon
 * @since 2025/5/24
 */
@Data
public class ChatMemberDO {
    /**
     * 聊天室ID
     */
    private Long chatId;
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 聊天室备注
     */
    private String chatRemark;
    /**
     * 聊天室昵称
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
