package lemoon.can.milkyway.config.websocket;

import java.security.Principal;

/**
 * @author lemoon
 * @since 2025/5/28
 */
public class StompPrincipal implements Principal {
    private final String userId;

    public StompPrincipal(String userId) {
        this.userId = userId;
    }

    @Override
    public String getName() {
        return userId;  // 这个就是用户的唯一标识
    }
}
