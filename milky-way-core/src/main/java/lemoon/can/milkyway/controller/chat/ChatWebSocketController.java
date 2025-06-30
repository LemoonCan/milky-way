package lemoon.can.milkyway.controller.chat;

import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.facade.dto.MessageContentDTO;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.param.MessageSendParam;
import lemoon.can.milkyway.facade.service.command.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
@Slf4j
public class ChatWebSocketController {
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 发送消息
     *
     * @param param 消息参数
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload MessageSendParam param, Principal principal) {
        // 调用消息服务处理消息并推送给接收方
        // MessageService内部会保存消息并通过ChatProcessorManager推送
        try {
            param.setSenderUserId(principal.getName());
            MessageDTO messageDTO = messageService.sendMessage(param);
            messageDTO.setClientMsgId(param.getClientMsgId());
            messagingTemplate.convertAndSendToUser(param.getSenderUserId(), "/queue/receipts",
                    Result.success(messageDTO));
        } catch (Exception e) {
            log.error("消息发送失败", e);
            // 处理异常，发送错误消息
            messagingTemplate.convertAndSendToUser(param.getSenderUserId(), "/queue/receipts",
                    Result.fail(ErrorCode.SYSTEM_ERROR,"消息发送失败"));
        }
    }
}
