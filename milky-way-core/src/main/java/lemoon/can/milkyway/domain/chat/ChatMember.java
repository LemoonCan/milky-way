package lemoon.can.milkyway.domain.chat;

/**
 * @author lemoon
 * @since 2025/5/23
 */
public class ChatMember {
    /**
     * 聊天成员ID
     */
    private Long userId;
    /**
     * 聊天室ID
     */
    private Long chatId;
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
