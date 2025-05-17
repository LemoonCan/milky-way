package lemoon.can.milkyway.domain.chat;

import lemoon.can.milkyway.common.enums.ChatType;
import java.util.Set;

/**
 * 聊天室
 * @author lemoon
 * @since 2025/5/16
 */
public abstract class Chat {
    /**
     * 参与人
     */
    protected Set<Long> participants;

    public abstract ChatType type();

    public Chat(Set<Long> participants) {
        this.participants = participants;
    }
}
