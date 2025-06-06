package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lemoon.can.milkyway.common.enums.MomentContentType;
import lombok.Data;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.io.Serializable;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/6/3
 */
@Data
public class PublishParam implements Serializable {
    String publishUserId;
    @NotNull(message = "内容类型不能为空")
    MomentContentType contentType;
    String text;
    List<String> medias;
    String location;

    @AssertTrue(message = "内容类型与具体内容不匹配")
    public boolean textMediasValid() {
        return switch (contentType) {
            case TEXT -> StringUtils.hasLength(text);
            case IMAGE, LINKED, VIDEO -> CollectionUtils.isEmpty(medias);
            case TEXT_IMAGE, TEXT_LINKED, TEXT_VIDEO -> StringUtils.hasLength(text) && !CollectionUtils.isEmpty(medias);
        };
    }
}
