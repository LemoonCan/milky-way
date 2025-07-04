package lemoon.can.milkyway.domain.friend;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lemoon.can.milkyway.common.enums.FriendPermissionEnum;
import lemoon.can.milkyway.common.enums.FriendStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * @author lemoon
 * @since 2025/4/29
 */
@Entity
@NoArgsConstructor
@Getter
public class Friend {
    /**
     * 主键
     */
    @EmbeddedId
    private FriendId id;
    /**
     * 好友状态
     */
    @Enumerated(EnumType.STRING)
    private FriendStatus status;
    /**
     * 备注
     */
    private String remark;
    /**
     * 权限
     */
    @Enumerated(EnumType.STRING)
    private FriendPermissionEnum permission;

    public Friend(String userId, String friendId) {
        this.id = new FriendId(userId, friendId);
        this.status = FriendStatus.ESTABLISHED;
    }

    public void setExtra(String remark, FriendPermissionEnum permission) {
        this.remark = remark;
        this.permission = permission;
    }

    /**
     * 拉黑
     */
    public void block() {
        this.status = FriendStatus.BLACKLISTED;
    }

    /**
     * 被拉黑
     */
    public void blockBy() {
        this.status = FriendStatus.BLACKLISTED_BY;
    }

    /**
     * 拉黑移除
     */
    public void unblock() {
        this.status = FriendStatus.ESTABLISHED;
    }
}
