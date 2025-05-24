package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.domain.chat.ChatMember;
import lemoon.can.milkyway.domain.chat.GroupChat;
import lemoon.can.milkyway.domain.chat.SingleChat;
import lemoon.can.milkyway.facade.param.ChatCreateParam;
import lemoon.can.milkyway.facade.param.ChatDeleteParam;
import lemoon.can.milkyway.facade.param.ChatMemberParam;
import lemoon.can.milkyway.facade.param.ChatUpdateParam;
import lemoon.can.milkyway.facade.service.command.ChatService;
import lemoon.can.milkyway.infrastructure.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author lemoon
 * @since 2025/5/21
 */
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final ChatRepository chatRepository;
    private final SecureId secureId;

    @Override
    public void createChat(ChatCreateParam param) {
        List<ChatMember> members = param.getMembers()
                .stream()
                .map(item -> new ChatMember(
                        secureId.decode(item, secureId.getUserSalt()))
                )
                .collect(Collectors.toList());

        switch (param.getChatType()) {
            case GROUP:
                Chat groupChat = new GroupChat(param.getTitle(), members);
                chatRepository.save(groupChat);
                break;
            case SINGLE:
                Chat singleChat = new SingleChat(param.getTitle(), members);
                chatRepository.save(singleChat);
                break;
        }
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

    @Override
    public void updateMemerInfo(ChatMemberParam param) {

    }
}
