package lemoon.can.milkyway.facade.service.command;

import lemoon.can.milkyway.common.enums.MessageType;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.param.MessageSendParam;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/15
 */
public interface MessageService {

    /**
     * 发送消息
     * @param param 参数
     * T 消息内容类型
     * @return 消息
     */
    MessageDTO sendMessage(MessageSendParam param);
}