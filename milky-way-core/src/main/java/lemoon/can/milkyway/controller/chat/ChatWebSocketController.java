package lemoon.can.milkyway.controller.chat;

import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.param.MessageSendParam;
import lemoon.can.milkyway.facade.service.command.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket聊天控制器
 * 处理基于WebSocket+STOMP协议的聊天消息
 *
 * @author lemoon
 * @since 2025/5/15
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    private final MessageService messageService;

    /**
     * 发送消息
     *
     * @param param 消息参数
     */
    @MessageMapping("/chat.sendMessage")
    public Result<MessageDTO> sendMessage(@Payload MessageSendParam param, Principal principal) {
        // 调用消息服务处理消息并推送给接收方
        // MessageService内部会保存消息并通过ChatProcessorManager推送
        param.setSenderUserId(principal.getName());
        MessageDTO messageDTO = messageService.sendMessage(param);
        return Result.success(messageDTO);
    }
}
