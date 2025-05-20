package lemoon.can.milkyway.domain.chat;

import lemoon.can.milkyway.common.enums.ChatType;
import java.util.Set;

/**
 * 聊天室
 * 聊天室基类，定义了聊天室的基本属性和方法
 * @author lemoon
 * @since 2025/5/16
 */
public abstract class Chat {
    /**
     * 参与人
     * 聊天参与者的用户ID集合
     */
    protected Set<Long> participants;

    /**
     * 获取聊天类型
     * @return 聊天类型
     */
    public abstract ChatType type();

    /**
     * 构造函数
     * @param participants 参与者ID集合
     */
    public Chat(Set<Long> participants) {
        this.participants = participants;
    }

    /**
     * 获取聊天参与者
     * @return 参与者ID集合
     */
    public Set<Long> getParticipants() {
        return participants;
    }
}
