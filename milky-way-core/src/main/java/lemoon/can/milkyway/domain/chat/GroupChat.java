package lemoon.can.milkyway.domain.chat;

import lemoon.can.milkyway.common.enums.ChatType;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/16
 */
@Getter
public class GroupChat extends Chat<GroupChat.ExtraInfo> {
    /**
     * 公告
     */
    @Setter
    private String bulletin;

    private ExtraInfo extraInfo;

    @Data
    public static class ExtraInfo{
        private String adminUserId;
    }

    public GroupChat(Long id, String title, List<ChatMember> members) {
        super(id, title, members);
    }

    public GroupChat(String title, List<ChatMember> members) {
        super(title, members);
        if (members.size() <= 2) {
            throw new IllegalArgumentException("群聊参与人必须大于2人");
        }
        if (members.size() > 500) {
            throw new IllegalArgumentException("群聊参与人必须小于500人");
        }
    }

    @Override
    public ChatType type() {
        return ChatType.GROUP;
    }

    public void admin(String userId) {
        if(this.members.stream().anyMatch(member -> member.getUserId().equals(userId))) {
            this.extraInfo = this.extraInfo == null ? new ExtraInfo() : this.extraInfo;
            this.extraInfo.setAdminUserId(userId);
            return;
        }
        throw new IllegalArgumentException("用户不是群成员，无法设置为管理员");
    }

    public void addMember(ChatMember member) {
        if (members.size() >= 500) {
            throw new IllegalArgumentException("群聊参与人必须小于500人");
        }
        members.add(member);
    }

    public void removeMember(ChatMember member) {
        if (members.size() <= 2) {
            throw new IllegalArgumentException("群聊参与人必须大于2人");
        }
        members.remove(member);
    }
}
