package lemoon.can.milkyway.config.websocket;

import lemoon.can.milkyway.config.properties.SecurityProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket配置类
 * 配置WebSocket和STOMP协议相关的设置
 *
 * @author lemoon
 * @since 2025/5/20
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final SecurityProperties securityProperties;
    /**
     * 声明此配置后，无需显示声明具体的订阅路径，就可接收相应前缀的订阅路径
     * 广播地址前缀，通常约定topic用作广播前缀，queue用作点对点前缀
     * 广播：
     * 1.订阅路径：/topic/{主题名}/{ID}
     * 2.推送路径：/topic/{主题名}/{ID}
     * 点对点：
     * 1.订阅路径：/user/queue/{主题名}
     * 2.推送路径：/user/{userID}/queue/{主题名}
     * <p>
     * 客户端发送消息前缀，通常约定为/app
     *
     * @param config MessageBrokerRegistry
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        //广播地址前缀
        config.enableSimpleBroker("/topic", "/queue");
        //客户端发送消息前缀
        config.setApplicationDestinationPrefixes("/app");
        //用户专属消息路径
        config.setUserDestinationPrefix("/user");
    }

    /**
     * 连接路径 wss://{domain}/ws
     * @param registry STOMP端点注册器
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(securityProperties.getWebsocket().getCorsAllowedOrigins())
        ;
    }

}
