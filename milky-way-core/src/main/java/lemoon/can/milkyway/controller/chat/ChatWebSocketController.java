package lemoon.can.milkyway.controller.chat;

import jakarta.validation.Valid;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.facade.param.MessageSendParam;
import lemoon.can.milkyway.facade.service.command.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

/**
 * WebSocket聊天控制器
 * 处理基于WebSocket+STOMP协议的聊天消息
 * 支持单聊和群聊的消息发送和接收
 * @author lemoon
 * @since 2025/5/15
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final MessageService messageService;
    /**
     * 发送消息
     * 客户端发送消息到服务器，服务器处理后通过ChatProcessor推送给接收方
     * @param param 消息参数，包含发送者ID、聊天室ID、消息类型和内容
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload @Valid MessageSendParam param) {
        // 调用消息服务处理消息并推送给接收方
        // MessageService内部会保存消息并通过ChatProcessorManager推送
        messageService.sendMessage(param);
    }

    /**
     * 订阅用户消息
     * 客户端订阅自己的消息频道，接收发送给自己的消息
     * 客户端应该订阅 /topic/user.{encodedUserId}
     * @return 订阅确认信息
     */
    @SubscribeMapping("/user.subscribe")
    public String subscribeUserMessages() {
        return "订阅用户消息成功";
    }

    /**
     * 订阅群聊消息
     * 客户端订阅群聊的消息频道，接收群聊中的消息
     * 客户端应该订阅 /topic/chat.{encodedChatId}
     * @return 订阅确认信息
     */
    @SubscribeMapping("/chat.subscribe")
    public String subscribeChatMessages() {
        return "订阅群聊消息成功";
    }
}
