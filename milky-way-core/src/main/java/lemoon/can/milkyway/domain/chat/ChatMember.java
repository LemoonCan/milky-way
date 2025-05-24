package lemoon.can.milkyway.domain.chat;

import lombok.Getter;
import lombok.Setter;

/**
 * @author lemoon
 * @since 2025/5/23
 */
@Getter
public class ChatMember {
    /**
     * 聊天室ID
     */
    private Long chatId;
    /**
     * 聊天成员ID
     */
    private Long userId;
    /**
     * 聊天室备注
     */
    @Setter
    protected String chatRemark;
    /**
     * 群聊昵称
     */
    @Setter
    private String chatNickName;
    /**
     * 免打扰
     */
    @Setter
    private Boolean mute;
    /**
     * 是否置顶
     */
    @Setter
    private Boolean top;

    public ChatMember(Long chatId, Long userId) {
        this.chatId = chatId;
        this.userId = userId;
    }

    public ChatMember(Long userId) {
        this.userId = userId;
    }
}
