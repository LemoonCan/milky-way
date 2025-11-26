package lemoon.can.milkyway.facade.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/11/26
 */
@Data
public class SimpleMessageDTO implements Serializable {
    private String senderOpenId;
    private String content;
}
