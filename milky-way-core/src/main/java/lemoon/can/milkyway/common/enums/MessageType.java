package lemoon.can.milkyway.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 消息类型
 *
 * @author lemoon
 * @since 2025/5/15
 */
@AllArgsConstructor
@Getter
public enum MessageType {
    /**
     * 系统消息
     */
    SYSTEM("系统消息"),
    /**
     * 文字
     */
    TEXT("文字"),
    /**
     * 图片
     */
    IMAGE("图片"),
    /**
     * 声音
     */
    VOICE("声音"),
    /**
     * 视频
     */
    VIDEO("视频"),
    /**
     * 文件
     */
    FILE("文件"),
    ;
    private final String desc;

    public boolean isMedia() {
        return this != SYSTEM && this != TEXT;
    }
}