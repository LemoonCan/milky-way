package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.MomentContentType;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/7/9
 */
@Data
public class MomentDescriptionDTO implements Serializable {
    private String id;
    private MomentContentType contentType;
    private String text;
    private List<String> medias;
}
