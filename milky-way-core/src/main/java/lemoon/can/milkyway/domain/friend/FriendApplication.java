package lemoon.can.milkyway.domain.friend;

import jakarta.persistence.*;
import lemoon.can.milkyway.common.enums.FriendApplyChannel;
import lemoon.can.milkyway.common.enums.FriendApplyStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.ZoneId;

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
    private String fromUserId;
    /**
     * 被申请用户ID
     */
    private String toUserId;
    /**
     * 申请渠道
     */
    @Enumerated(EnumType.STRING)
    private FriendApplyChannel applyChannel;
    /**
     * 申请信息
     */
    private String applyMsg;
    /**
     * 状态
     */
    @Enumerated(EnumType.STRING)
    private FriendApplyStatus status;

    @Setter
    @Embedded
    private FriendApplicationExtraInfo extraInfo;

    /**
     * 创建时间
     */
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createTime;

    public FriendApplication(String fromUserId, String toUserId, FriendApplyChannel applyChannel, String applyMsg) {
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.applyChannel = applyChannel;
        this.applyMsg = applyMsg;
        this.status = FriendApplyStatus.APPLYING;
    }

    public void handle(FriendApplyStatus status) {
        this.status = status;
    }

    public static void main(String[] args) {
        System.out.println("JVM 默认时区: " + ZoneId.systemDefault());
    }
}
