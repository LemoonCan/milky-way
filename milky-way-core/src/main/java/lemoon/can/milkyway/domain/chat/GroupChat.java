package lemoon.can.milkyway.domain.chat;

import lemoon.can.milkyway.common.enums.ChatType;
import java.util.Set;

/**
 * @author lemoon
 * @since 2025/5/16
 */
public class GroupChat extends Chat {
    /**
     * 公告
     */
    private String bulletin;

    public GroupChat(Set<Long> participants) {
        super(participants);
        if (participants.size() < 3) {
            throw new IllegalArgumentException("群聊参与人必须大于2人");
        }
        if (participants.size() > 500) {
            throw new IllegalArgumentException("群聊参与人必须小于500人");
        }
    }

    @Override
    public ChatType type() {
        return ChatType.GROUP;
    }

    public void addParticipants(Set<Long> participants) {
        this.participants.addAll(participants);
    }

    public void removeParticipant(Long participant) {
        this.participants.remove(participant);
    }
}
