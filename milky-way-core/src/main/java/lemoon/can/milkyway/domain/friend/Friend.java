package lemoon.can.milkyway.domain.friend;

import jakarta.persistence.*;
import lemoon.can.milkyway.domain.user.User;

/**
 * @author lemoon
 * @since 2025/4/29
 */
@Entity
public class Friend {
    @EmbeddedId
    private FriendId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id",referencedColumnName = "id")
    private User user;

    @ManyToOne
    @MapsId("friendId")
    @JoinColumn(name = "friend_id", referencedColumnName = "id")
    private User friend;

    @Enumerated(EnumType.STRING)
    private FriendStatus status;
    private String remark;
    @Enumerated(EnumType.STRING)
    private FriendPermissionEnum permission;
}
