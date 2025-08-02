package lemoon.can.milkyway.infrastructure.repository.dos;

import lemoon.can.milkyway.common.enums.ChatType;
import lemoon.can.milkyway.common.enums.MessageType;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * @author lemoon
 * @since 2025/6/27
 */
@Data
public class ChatInfoDO {
    /**
     * 聊天室ID
     */
    private Long id;
    /**
     * 聊天室类型
     */
    private ChatType chatType;
    /**
     * 聊天室名称
     */
    private String title;
    /**
     * 头像(单聊时为对方头像，群聊时为群头像)
     */
    private String avatar;
    /**
     * 好友ID(单聊时为对方用户ID，群聊时无效)
     */
    private String friendId;
    /**
     * 最新消息ID
     */
    private Long lastMessageId;
    /**
     * 最新消息时间
     */
    private MessageType lastMessageType;
    /**
     * 最新消息
     */
    private String lastMessage;
    /**
     * 最新消息时间
     */
    private LocalDateTime lastMessageTime;
    /**
     * 未读消息数
     */
    private int unreadCount;

    /**
     * 未读的最小消息ID
     */
    private Long minUnreadMessageId;
    /**
     * 是否在线(单聊时显示对方在线状态，群聊时无效)
     */
    private boolean online;
}
