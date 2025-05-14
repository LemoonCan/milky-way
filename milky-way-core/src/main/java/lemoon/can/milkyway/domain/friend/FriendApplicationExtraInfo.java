package lemoon.can.milkyway.domain.friend;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * @author lemoon
 * @since 2025/5/14
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class FriendApplicationExtraInfo {
    /**
     * 备注
     */
    private String remark;
    /**
     * 权限
     */
    @Enumerated(EnumType.STRING)
    private FriendPermissionEnum permission;
}
