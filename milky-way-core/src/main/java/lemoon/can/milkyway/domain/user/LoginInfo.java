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
     * (实时在线状态)
     */
    private Integer online;

    /**
     * 是否登录(0否/1是)
     */
    private Integer logged;

    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginTime;
    /**
     * 最后登录IP
     */
    private LocalDateTime lastLoginIp;

    /**
     * 最后登录设备
     */
    private String lastLoginDevice;

    /**
     * 最后登录token
     */
    private String lastLoginToken;

    public void logout() {
        this.logged = 0;
        this.lastLoginToken = null;
    }
}
