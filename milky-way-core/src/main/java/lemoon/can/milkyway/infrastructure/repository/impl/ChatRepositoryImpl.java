package lemoon.can.milkyway.infrastructure.repository.impl;

import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.domain.chat.Chat;
import lemoon.can.milkyway.domain.chat.ChatMember;
import lemoon.can.milkyway.domain.chat.GroupChat;
import lemoon.can.milkyway.domain.chat.SingleChat;
import lemoon.can.milkyway.infrastructure.repository.ChatRepository;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatDO;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatMemberDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author lemoon
 * @since 2025/5/20
 */
@Repository
@RequiredArgsConstructor
public class ChatRepositoryImpl implements ChatRepository {
    private final ChatMapper chatMapper;
    private final ChatMemberMapper chatMemberMapper;

    @Override
    public Chat findById(Long id) {
        ChatDO chatDO = chatMapper.selectById(id);
        List<ChatMemberDO> chatMemberDOList = chatMemberMapper.selectByChatId(id);
        List<ChatMember> members = chatMemberDOList
                .stream()
                .map(item -> {
                    ChatMember member = new ChatMember(item.getChatId(), item.getUserId());
                    member.setChatRemark(item.getChatRemark());
                    member.setChatNickName(item.getChatNickName());
                    member.setMute(item.getMute());
                    member.setTop(item.getTop());
                    return member;
                })
                .collect(Collectors.toList());

        switch (chatDO.getType()) {
            case GROUP:
                GroupChat groupChat = new GroupChat(chatDO.getId(), chatDO.getTitle(), members);
                groupChat.setBulletin(chatDO.getBulletin());
                return groupChat;
            case SINGLE:
                return new SingleChat(chatDO.getId(), chatDO.getTitle(), members);
        }
        throw new BusinessException(ErrorCode.NOT_FOUND, "聊天室不存在");
    }

    @Override
    public <T extends Chat<?>> Long save(T chat) {
        ChatDO chatDO = new ChatDO();
        chatDO.setTitle(chat.getTitle());
        chatDO.setType(chat.type());
        chatDO.setExtraInfo(chat.extraInfo());
        chatMapper.insert(chatDO);

        List<ChatMemberDO> chatMemberDOList = chat.getMembers()
                .stream()
                .map(item -> {
                    ChatMemberDO chatMemberDO = new ChatMemberDO();
                    chatMemberDO.setChatId(chatDO.getId());
                    chatMemberDO.setUserId(item.getUserId());
                    return chatMemberDO;
                })
                .collect(Collectors.toList());
        chatMemberMapper.batchInsert(chatMemberDOList);
        return chatDO.getId();
    }

    @Override
    public void delete(Long id) {
        chatMapper.deleteById(id);
        chatMemberMapper.deleteByChatId(id);
    }
}
