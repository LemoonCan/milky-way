package lemoon.can.milkyway.domain.chat;

import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.param.MessageSendParam;

/**
 * 消息处理器
 * 实现类命名: {@link lemoon.can.milkyway.common.enums.MessageType}+MessageProcessor
 * @author lemoon
 * @since 2025/5/16
 */
public interface MessageProcessor<T> {
    MessageDTO store(MessageSendParam param);
    void push(T message);
}
