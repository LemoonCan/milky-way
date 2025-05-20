package lemoon.can.milkyway.controller.chat;

import lemoon.can.milkyway.facade.service.command.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author lemoon
 * @since 2025/5/15
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;


}
