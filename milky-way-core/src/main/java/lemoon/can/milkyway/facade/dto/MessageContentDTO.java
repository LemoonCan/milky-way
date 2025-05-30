package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/5/30
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageContentDTO implements Serializable {
    /**
     * 类型
     */
    private MessageType type;
    /**
     * 内容
     */
    private String content;
}
