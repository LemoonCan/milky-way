package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.common.enums.ChatType;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.domain.chat.ChatMember;
import lemoon.can.milkyway.domain.chat.GroupChat;
import lemoon.can.milkyway.domain.chat.SingleChat;
import lemoon.can.milkyway.facade.dto.ChatDTO;
import lemoon.can.milkyway.facade.param.ChatCreateParam;
import lemoon.can.milkyway.facade.param.ChatDeleteParam;
import lemoon.can.milkyway.facade.param.ChatMemberParam;
import lemoon.can.milkyway.facade.param.ChatUpdateParam;
import lemoon.can.milkyway.facade.service.command.ChatService;
import lemoon.can.milkyway.infrastructure.repository.ChatRepository;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatDO;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatMemberDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final ChatMapper chatMapper;
    private final ChatMemberMapper chatMemberMapper;

    @Transactional
    @Override
    public ChatDTO createChat(ChatCreateParam param) {
        //TODO 请求幂等

        List<ChatMember> members = param.getMembers()
                .stream()
                .map(ChatMember::new)
                .collect(Collectors.toList());

        Chat chat = switch (param.getChatType()) {
            case GROUP -> new GroupChat(param.getTitle(), members);
            case SINGLE -> new SingleChat(param.getTitle(), members);
            default -> throw new BusinessException(ErrorCode.UNSUPPORTED, "不支持的聊天室类型");
        };

        Long chatId = chatRepository.save(chat);
        ChatDTO chatDTO = new ChatDTO();
        chatDTO.setId(secureId.simpleEncode(chatId, secureId.getChatSalt()));
        chatDTO.setTitle(chat.getTitle());
        return chatDTO;
    }

    @Override
    public void deleteChat(ChatDeleteParam param) {
        //权限校验
        Long chatId = secureId.simpleDecode(param.getChatId(), secureId.getChatSalt());
        chatRepository.delete(chatId);
    }

    @Override
    public void updateChat(ChatUpdateParam param) {
        //TODO 权限校验
        Long chatId = secureId.simpleDecode(param.getChatId(), secureId.getChatSalt());

        ChatDO updateParam = new ChatDO();
        updateParam.setId(chatId);
        updateParam.setTitle(param.getTitle());
        updateParam.setBulletin(param.getBulletin());
        chatMapper.update(updateParam);
    }

    @Override
    public void addMember(String chatId, String userId) {
        Long realChatId = secureId.simpleDecode(chatId, secureId.getChatSalt());

        ChatType chatType = chatMapper.selectTypeById(realChatId);
        if (!ChatType.GROUP.equals(chatType)) {
            throw new BusinessException(ErrorCode.UNSUPPORTED, "仅支持添加群聊成员");
        }

        if (chatMemberMapper.exists(realChatId, userId) == 1) {
            throw new BusinessException(ErrorCode.UNSUPPORTED, "用户已在聊天室");
        }
        ChatMemberDO member = new ChatMemberDO();
        member.setChatId(realChatId);
        member.setUserId(userId);
        chatMemberMapper.insert(member);
    }

    @Override
    public void deleteMember(String chatId, String userId) {
        Long realChatId = secureId.simpleDecode(chatId, secureId.getChatSalt());
        chatMemberMapper.deleteByChatIdAndUserId(realChatId, userId);
    }

    @Override
    public void updateMemerInfo(ChatMemberParam param) {
        ChatMemberDO updateParam = new ChatMemberDO();
        updateParam.setChatId(secureId.simpleDecode(param.getChatId(), secureId.getChatSalt()));
        updateParam.setUserId(param.getUserId());
        updateParam.setChatRemark(param.getChatRemark());
        updateParam.setChatNickName(param.getChatNickName());
        updateParam.setMute(param.getMute());
        updateParam.setTop(param.getTop());
        chatMemberMapper.update(updateParam);
    }

    @Override
    public void read(String chatId, String userId) {

    }
}
