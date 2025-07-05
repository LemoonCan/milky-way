package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.MessageNotifyType;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/7/5
 */
@Data
public class MessageNotifyDTO<T> implements Serializable {
    private MessageNotifyType notifyType;
    private T content;
}
