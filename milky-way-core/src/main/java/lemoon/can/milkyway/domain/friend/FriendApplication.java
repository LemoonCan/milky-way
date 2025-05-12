package lemoon.can.milkyway.domain.friend;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
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
}
