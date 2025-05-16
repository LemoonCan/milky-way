package lemoon.can.milkyway.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author lemoon
 * @since 2025/5/16
 */
@AllArgsConstructor
@Getter
public enum ChatType {
    SINGLE("单聊"),
    GROUP("群聊"),
    ;
    private final String desc;
}
