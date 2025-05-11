package lemoon.can.milkyway.facade.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author lemoon
 * @since 2025/5/11
 */
@Data
@NoArgsConstructor
public class FileInfoDTO {
    private String fileId;
    private String fileAccessUrl;
}
