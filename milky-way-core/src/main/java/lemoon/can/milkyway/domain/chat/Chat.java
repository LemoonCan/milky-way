package lemoon.can.milkyway.domain.chat;

import lemoon.can.milkyway.common.enums.ChatType;
import lombok.Getter;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 聊天室
 * 聊天室基类，定义了聊天室的基本属性和方法
 * @author lemoon
 * @since 2025/5/16
 */
@Getter
public abstract class Chat {
    protected Long id;
    protected String title;
    protected List<ChatMember> members;

    public Chat(Long id, String title, List<ChatMember> members) {
        this.id = id;
        this.title = title;
        this.members = members;
    }

    public Chat(String title, List<ChatMember> members) {
        this.title = StringUtils.hasLength(title)? title : "宇宙里的某个星座";
        this.members = members;
    }

    /**
     * 获取聊天类型
     * @return 聊天类型
     */
    public abstract ChatType type();
}
