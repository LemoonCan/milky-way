package lemoon.can.milkyway.facade.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/5/26
 */
@Data
public class ChatDTO implements Serializable {
    private String id;
    private String title;
}
