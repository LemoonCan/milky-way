package lemoon.can.milkyway.domain.chat;

import lemoon.can.milkyway.common.enums.ChatType;
import lombok.Getter;

import java.util.List;
import java.util.Set;

/**
 * 聊天室
 * 聊天室基类，定义了聊天室的基本属性和方法
 * @author lemoon
 * @since 2025/5/16
 */
@Getter
public abstract class Chat {
    protected Long id;
    protected String name;
    protected List<ChatMember> members;

    /**
     * 获取聊天类型
     * @return 聊天类型
     */
    public abstract ChatType type();
}
