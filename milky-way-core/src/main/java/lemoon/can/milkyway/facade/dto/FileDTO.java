package lemoon.can.milkyway.facade.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.core.io.Resource;

/**
 * @author lemoon
 * @since 2025/5/9
 */
@Data
@AllArgsConstructor
public class FileDTO {
    private String fileId;
    private String fileType;
    private Resource resource;
}
