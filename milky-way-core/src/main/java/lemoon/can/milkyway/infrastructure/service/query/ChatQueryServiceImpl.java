package lemoon.can.milkyway.infrastructure.service.query;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.facade.dto.ChatInfoDTO;
import lemoon.can.milkyway.facade.dto.MessageDTO;
import lemoon.can.milkyway.facade.dto.MessageInfoDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.param.ChatMessagesQueryParam;
import lemoon.can.milkyway.facade.service.query.ChatQueryService;
import lemoon.can.milkyway.infrastructure.converter.ChatConverter;
import lemoon.can.milkyway.infrastructure.converter.MessageConverter2;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatInfoDO;
import lemoon.can.milkyway.infrastructure.repository.dos.MessageDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.MessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.format.DateTimeFormatter;
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
    private final SecureId secureId;
    private final ChatConverter chatConverter;
    private final MessageMapper messageMapper;
    private final SecureIdConverterHelper secureIdConverterHelper;
    private final MessageConverter2 messageConverter2;

    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public List<String> getGroupChats(String userId) {
        return chatMapper.findGroupChats(userId).stream()
                .map(item ->
                        secureId.simpleEncode(item, secureId.getChatSalt()))
                .toList();
    }

    @Override
    public Slices<ChatInfoDTO> getChatList(String userId, String lastId, Integer pageSize) {
        // 设置默认分页大小
        int size = pageSize != null && pageSize > 0 ? Math.min(pageSize, 50) : 20;

        // 解码游标为实际的聊天室ID
        Long decodedLastId = null;
        if (StringUtils.hasText(lastId)) {
            decodedLastId = secureId.simpleDecode(lastId, secureId.getChatSalt());
        }

        // 查询数据，多查一条用于判断是否还有更多数据
        List<ChatInfoDO> chatDoList = chatMapper.findChatsByUserId(userId, decodedLastId, size + 1);

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
                    .map(messageConverter2::toMessageInfoDTO)
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
                messageDTOS.add(messageConverter2.toMessageInfoDTO(messageDos.get(i)));
            }
        }

        return new Slices<>(messageDTOS, hasNext);
    }
}
