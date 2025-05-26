package lemoon.can.milkyway.domain.user;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * @author lemoon
 * @since 2025/4/21
 */
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class LoginInfo {
    /**
     * 状态(0离线/1在线)
     */
    private Integer online;
    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginTime;
    /**
     * 最后登录IP
     */
    private LocalDateTime lastLoginIp;

    //登录设备
    private String lastLoginDevice;

    public void logout() {
        this.online = 0;
    }
}
