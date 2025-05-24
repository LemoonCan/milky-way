package lemoon.can.milkyway.domain.chat;

import lemoon.can.milkyway.common.enums.ChatType;

import java.util.List;

/**
 * 聊天
 *
 * @author lemoon
 * @since 2025/5/16
 */
public class SingleChat extends Chat {
    public SingleChat(Long id, String title, List<ChatMember> members) {
        super(id, title, members);
    }

    public SingleChat(String title, List<ChatMember> members) {
        super(title, members);
        if (members.size() != 2) {
            throw new IllegalArgumentException("单聊参与人必须为2人");
        }
    }

    @Override
    public ChatType type() {
        return ChatType.SINGLE;
    }
}
