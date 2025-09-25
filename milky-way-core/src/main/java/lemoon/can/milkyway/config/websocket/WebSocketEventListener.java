package lemoon.can.milkyway.config.websocket;

import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.user.SimpSession;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Optional;
import java.util.Set;

/**
 * @author lemoon
 * @since 2025/9/19
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {
    private final SimpUserRegistry simpUserRegistry;
    private final UserRepository userRepository;
    /**
     * WebSocket连接建立事件
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        // 从认证信息中获取用户ID
        Principal principal = headerAccessor.getUser();

        if (principal != null) {
            String userId = principal.getName();
            log.info("用户 {} 建立WebSocket连接，会话ID: {}", userId, sessionId);
            if(simpUserRegistry.getUser(userId)!=null){
                Optional<User> userOptional = userRepository.findById(userId);
                if(userOptional.isPresent()){
                    User user = userOptional.get();
                    user.online();
                    userRepository.save(user);
                }
            }
        }
    }

    /**
     * WebSocket连接断开事件
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        // 从缓存中获取用户信息
        Principal principal = headerAccessor.getUser();
        if (principal != null) {
            log.info("用户 {} 断开WebSocket连接，会话ID: {}", principal.getName(), sessionId);
            String userId = principal.getName();
            try {
                Set<SimpSession> sessions = simpUserRegistry.getUser(userId).getSessions();
                if(CollectionUtils.isEmpty(sessions)) return;
                Optional<User> userOptional = userRepository.findById(userId);
                if(userOptional.isPresent()){
                    User user = userOptional.get();
                    user.outline();
                    userRepository.save(user);
                }
            } catch (NullPointerException e) {
                log.info("用户 {} 查询会话异常", userId);
            }
        }
    }


}
