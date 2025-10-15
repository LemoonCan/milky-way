package lemoon.can.milkyway.infrastructure.service.query;

import lemoon.can.milkyway.facade.dto.ChatInfoDTO;
import lemoon.can.milkyway.facade.dto.MessageInfoDTO;
import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.param.ChatMessagesQueryParam;
import lemoon.can.milkyway.facade.service.query.ChatQueryService;
import lemoon.can.milkyway.infrastructure.converter.ChatConverter;
import lemoon.can.milkyway.infrastructure.converter.MessageConverter;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatInfoDO;
import lemoon.can.milkyway.infrastructure.repository.dos.MessageDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.MessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author lemoon
 * @since 2025/6/10
 */
@Service
@RequiredArgsConstructor
public class ChatQueryServiceImpl implements ChatQueryService {
    private final ChatMapper chatMapper;
    private final ChatConverter chatConverter;
    private final MessageMapper messageMapper;
    private final SecureIdConverterHelper secureIdConverterHelper;
    private final MessageConverter messageConverter;

    @Override
    public ChatInfoDTO getSingleChat(String userId, String friendUserId) {
        ChatInfoDO chatInfoDO = chatMapper.findSingleChat(userId, friendUserId);
        return chatConverter.toDto(chatInfoDO);
    }

    @Override
    public List<String> getGroupChats(String userId) {
        return chatMapper.findGroupChats(userId).stream()
                .map(secureIdConverterHelper::encodeChatId)
                .toList();
    }

    @Override
    public Slices<ChatInfoDTO> getChatList(String userId, String lastMessageId, Integer pageSize) {
        // 设置默认分页大小
        int size = pageSize != null && pageSize > 0 ? Math.min(pageSize, 50) : 20;

        // 解码游标为实际的消息ID
        Long decodedLastMessageId = null;
        if (StringUtils.hasText(lastMessageId)) {
            decodedLastMessageId = secureIdConverterHelper.decodeMessageId(lastMessageId);
        }

        // 查询数据，多查一条用于判断是否还有更多数据
        List<ChatInfoDO> chatDoList = chatMapper.findChatsByUserId(userId, decodedLastMessageId, size + 1);

        // 判断是否还有更多数据
        boolean hasNext = chatDoList.size() > size;
        if (hasNext) {
            // 移除多查的那一条
            chatDoList = chatDoList.subList(0, size);
        }

        // 将DO转换为DTO
        List<ChatInfoDTO> chatDtoList = chatDoList.stream()
                .map(chatConverter::toDto)
                .collect(Collectors.toList());

        return new Slices<>(chatDtoList, hasNext);
    }

    @Override
    public Slices<MessageInfoDTO> getChatMessages(ChatMessagesQueryParam param) {
        List<MessageInfoDTO> messageDTOS = new ArrayList<>();
        boolean hasNext;
        //向后滚动
        if (StringUtils.hasLength(param.getAfter())) {
            List<MessageDO> messageDos = messageMapper.getMessagesAfter(
                    secureIdConverterHelper.decodeChatId(param.getChatId()),
                    secureIdConverterHelper.decodeMessageId(param.getAfter()),
                    param.getPageSize() + 1);
            hasNext = messageDos.size() > param.getPageSize();
            if (hasNext) {
                messageDos.remove((messageDos.size() - 1));
            }
            messageDTOS = messageDos.stream()
                    .map(messageConverter::toMessageInfoDTO)
                    .toList();
        } else {
            //向前滚动
            List<MessageDO> messageDos = messageMapper.getMessagesBefore(
                    secureIdConverterHelper.decodeChatId(param.getChatId()),
                    StringUtils.hasLength(param.getBefore()) ? secureIdConverterHelper.decodeMessageId(param.getBefore()) : null,
                    param.getPageSize() + 1);
            hasNext = messageDos.size() > param.getPageSize();
            if (hasNext) {
                messageDos.remove((messageDos.size() - 1));
            }

            for (int i = messageDos.size() - 1; i >= 0; i--) {
                messageDTOS.add(messageConverter.toMessageInfoDTO(messageDos.get(i)));
            }
        }

        return new Slices<>(messageDTOS, hasNext);
    }

    @Override
    public Slices<SimpleUserDTO> getGroupChatMembers(String chatId, String lastUserId, Integer pageSize) {
        int size = pageSize != null && pageSize > 0 ? Math.min(pageSize, 50) : 20;

        List<SimpleUserDTO> members = chatMapper.findChatMembers(chatId, lastUserId, size);
        boolean hasNext = members.size() > size;
        if (hasNext) {
            members = members.subList(0, size);
        }
        return new Slices<>(members, hasNext);
    }
}
