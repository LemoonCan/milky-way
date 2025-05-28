package lemoon.can.milkyway.config.websocket;

import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.common.utils.security.HttpHeaderToken;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

/**
 * @author lemoon
 * @since 2025/5/28
 */
@Component
@RequiredArgsConstructor
public class CustomerHandShakeHandler extends DefaultHandshakeHandler {
    private final SecureId secureId;

    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {
        Optional.ofNullable(request.getPrincipal())
                .orElseThrow(() -> new BusinessException(ErrorCode.UNCERTIFIED, "用户未认证"));
        String userId = request.getPrincipal().getName();

        // 返回Principal，Spring会自动管理用户会话
        return new StompPrincipal(secureId.decode(userId, secureId.getUserSalt()).toString());
    }
}
