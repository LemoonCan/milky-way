package lemoon.can.milkyway.facade.dto;

import lemoon.can.milkyway.common.enums.MessageType;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/7/14
 */
@Data
public class MessageMetaDTO implements Serializable {
    /**
     * 类型
     */
    private MessageType type;

    /**
     * 内容
     */
    private String content;

    /**
     * 当消息类型为图片、声音、视频或文件时，存储媒体文件链接
     */
    private String media;
}
