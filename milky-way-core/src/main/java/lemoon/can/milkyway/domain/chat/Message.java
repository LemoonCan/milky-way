package lemoon.can.milkyway.domain.chat;

import jakarta.persistence.*;
import lemoon.can.milkyway.common.enums.MessageType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 消息
 *
 * @author lemoon
 * @since 2025/5/15
 */
@Entity
@Table(name = "message")
@Getter
@NoArgsConstructor
public class Message {
    /**
     * Message ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 聊天ID
     */
    private Long chatId;

    /**
     * 发送者ID
     */
    private String senderId;

    /**
     * 内容(文字为字符串、其他为地址)
     */
    @Column
    private String content;

    /**
     * 消息类型
     */
    @Enumerated(EnumType.STRING)
    private MessageType type;

    /**
     * 消息发送时间
     */
    private LocalDateTime sentTime;

    public Message(Long chatId, String senderId, MessageType type, String content) {
        this.chatId = chatId;
        this.senderId = senderId;
        this.content = content;
        this.type = type;
        this.sentTime = LocalDateTime.now();
    }
}