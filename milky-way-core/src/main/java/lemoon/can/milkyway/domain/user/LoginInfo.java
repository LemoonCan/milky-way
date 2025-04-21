package lemoon.can.milkyway.domain.user;

import java.time.LocalDateTime;

/**
 * @author lemoon
 * @since 2025/4/21
 */
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
}
