package lemoon.can.milkyway.domain.chat;

import lemoon.can.milkyway.common.enums.ChatType;
import lemoon.can.milkyway.domain.user.Long;

import java.util.Set;

/**
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
