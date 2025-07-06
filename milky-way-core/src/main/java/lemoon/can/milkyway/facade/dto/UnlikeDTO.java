package lemoon.can.milkyway.facade.dto;

import lombok.Data;
import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/7/6
 */
@Data
public class UnlikeDTO implements Serializable {
    private String momentId;
    private String unlikeUserId;
    private String publishUserId;
}
