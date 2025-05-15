package lemoon.can.milkyway.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author lemoon
 * @since 2025/5/11
 */
@AllArgsConstructor
@Getter
public enum FilePermissionEnum {
    PUBLIC("公开"),
    PRIVATE("私有");

    private final String desc;
}
