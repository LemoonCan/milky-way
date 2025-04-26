package lemoon.can.milkyway.controller;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * @author lemoon
 * @since 2025/4/26
 */
@AllArgsConstructor
@Getter
public enum Errors {
    INVALID_PARAM("参数错误");

    private final String msg;
}
