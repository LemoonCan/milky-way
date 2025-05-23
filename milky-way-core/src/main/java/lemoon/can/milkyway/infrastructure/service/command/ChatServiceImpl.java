package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.facade.param.ChatCreateParam;
import lemoon.can.milkyway.facade.param.ChatDeleteParam;
import lemoon.can.milkyway.facade.param.ChatUpdateParam;
import lemoon.can.milkyway.facade.service.command.ChatService;
import lemoon.can.milkyway.infrastructure.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * @author lemoon
 * @since 2025/5/21
 */
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final ChatRepository chatRepository;

    @Override
    public void createChat(ChatCreateParam param) {

    }

    @Override
    public void deleteChat(ChatDeleteParam param) {

    }

    @Override
    public void updateChat(ChatUpdateParam param) {

    }

    @Override
    public void addMember(String chatId, String userId) {

    }
}
