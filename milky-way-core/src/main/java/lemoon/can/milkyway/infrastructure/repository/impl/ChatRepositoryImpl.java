package lemoon.can.milkyway.infrastructure.repository.impl;

import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.domain.chat.GroupChat;
import lemoon.can.milkyway.domain.chat.SingleChat;
import lemoon.can.milkyway.infrastructure.repository.ChatRepository;
import org.springframework.stereotype.Repository;

/**
 * @author lemoon
 * @since 2025/5/20
 */
@Repository
public class ChatRepositoryImpl implements ChatRepository {
    @Override
    public Chat findById(Long id) {
        return null;
    }

    @Override
    public <T extends Chat> void save(T chat) {
        if(chat instanceof GroupChat groupChat){
            return;
        }
        if(chat instanceof SingleChat singleChat){
            return;
        }
    }
}
