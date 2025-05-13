package lemoon.can.milkyway.domain.friend;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * @author lemoon
 * @since 2025/5/12
 */
@Entity
@Getter
@NoArgsConstructor
public class FriendApplication {
    /**
     * 主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    /**
     * 申请用户ID
     */
    private Long fromUserId;
    /**
     * 被申请用户ID
     */
    private Long toUserId;
    /**
     * 申请信息
     */
    private String applyMsg;
    /**
     * 状态
     */
    @Enumerated(EnumType.STRING)
    private FriendApplyStatus status;

    public FriendApplication(Long fromUserId, Long toUserId, String applyMsg) {
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.applyMsg = applyMsg;
        this.status = FriendApplyStatus.APPLYING;
    }

    public void handle(FriendApplyStatus status) {
        this.status = status;
    }
}
