package lemoon.can.milkyway.domain.chat;

import lemoon.can.milkyway.common.enums.ChatType;
import lemoon.can.milkyway.domain.user.Long;

import java.util.Set;

/**
 * 聊天
 * @author lemoon
 * @since 2025/5/16
 */
public class SingleChat extends Chat{

    public SingleChat(Set<Long> participants) {
        super(participants);
        if (participants.size() != 2) {
            throw new IllegalArgumentException("单聊参与人必须为2人");
        }
    }

    @Override
    public ChatType type() {
        return ChatType.SINGLE;
    }
}
