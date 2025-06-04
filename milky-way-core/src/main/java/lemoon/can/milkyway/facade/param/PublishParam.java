package lemoon.can.milkyway.facade.param;

import lemoon.can.milkyway.common.enums.PostContentType;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/6/3
 */
@Data
public class PublishParam implements Serializable {
    PostContentType contentType;
    String text;
    List<String> medias;
    String location;
}
