package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.common.enums.ChatType;
import lemoon.can.milkyway.common.enums.MessageType;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.chat.*;
import lemoon.can.milkyway.facade.dto.ChatInfoDTO;
import lemoon.can.milkyway.facade.dto.SimpleMessageDTO;
import lemoon.can.milkyway.facade.param.*;
import lemoon.can.milkyway.facade.service.command.AiAssistantService;
import lemoon.can.milkyway.facade.service.command.ChatService;
import lemoon.can.milkyway.infrastructure.converter.ChatConverter;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.inner.chat.ChatProcessorManager;
import lemoon.can.milkyway.infrastructure.inner.chat.GroupChatProcessor;
import lemoon.can.milkyway.infrastructure.repository.ChatRepository;
import lemoon.can.milkyway.infrastructure.repository.MessageReadCursorRepository;
import lemoon.can.milkyway.infrastructure.repository.MessageRepository;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatDO;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatInfoDO;
import lemoon.can.milkyway.infrastructure.repository.dos.ChatMemberDO;
import lemoon.can.milkyway.infrastructure.repository.dos.MessageDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMemberMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.MessageMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
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
    private final SecureIdConverterHelper secureIdConverterHelper;
    private final MessageReadCursorRepository messageReadCursorRepository;
    private final MessageRepository messageRepository;
    private final MessageMapper messageMapper;
    private final ChatProcessorManager chatProcessorManager;
    private final ChatConverter chatConverter;
    private final GroupChatProcessor groupChatProcessor;
    private final AiAssistantService aiAssistantService;
    private final UserMapper userMapper;

    @Transactional
    @Override
    public ChatInfoDTO createChat(ChatCreateParam param) {
        //TODO 请求幂等
        List<ChatMember> members = param.getMembers()
                .stream()
                .map(ChatMember::new)
                .collect(Collectors.toList());

        Chat<?> chat = switch (param.getChatType()) {
            case GROUP -> {
                GroupChat groupChat = new GroupChat(param.getTitle(), members);
                groupChat.admin(param.getOperateUserId());
                yield groupChat;
            }
            case SINGLE -> new SingleChat(param.getTitle(), members);
            default -> throw new BusinessException(ErrorCode.UNSUPPORTED, "不支持的聊天室类型");
        };

        Long chatId = chatRepository.save(chat);
        Message message = new Message(chatId, param.getOperateUserId(),
                MessageType.SYSTEM, param.getDefaultMessage());
        messageRepository.save(message);

        ChatInfoDO chatInfoDO = chatMapper.selectChatInfoById(chatId);
        ChatInfoDTO chatInfoDTO = chatConverter.toDto(chatInfoDO);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                chatProcessorManager.pushChatCreatedMsg(chatId, param.getOperateUserId(), chatInfoDTO);
            }
        });
        return chatInfoDTO;
    }

    @Override
    @Transactional
    public void deleteChat(ChatDeleteParam param) {
        //TODO 权限校验
        Long chatId = secureId.simpleDecode(param.getChatId(), secureId.getChatSalt());
        ChatType chatType = chatMapper.selectTypeById(chatId);
        List<String> memberUserIds = chatMemberMapper.selectMemberUserIdsByChatId(chatId);
        chatRepository.delete(chatId);

        chatMemberMapper.deleteByChatId(chatId);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                chatProcessorManager.pushChatDeletedMsg(chatId, param.getOperateUserId(), chatType, memberUserIds);
            }
        });
    }

    @Override
    @Transactional
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
    @Transactional
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

        ChatInfoDTO chatInfoDTO = chatConverter.toDto(chatMapper.selectChatInfoById(realChatId));

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                groupChatProcessor.pushAddMemberMsg(userId, chatInfoDTO);
            }
        });
    }

    @Override
    @Transactional
    public void deleteMember(String chatId, String userId) {
        Long realChatId = secureId.simpleDecode(chatId, secureId.getChatSalt());
        chatMemberMapper.deleteByChatIdAndUserId(realChatId, userId);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                groupChatProcessor.pushDeleteMemberMsg(userId, realChatId);
            }
        });
    }

    @Override
    @Transactional
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
    @Transactional
    public void read(MessageReadParam param) {
        //检查聊天室是否存在
        Long chatId = secureIdConverterHelper.decodeChatId(param.getChatId());
        if (!chatMapper.existsById(chatId)) {
            throw new BusinessException(ErrorCode.INVALID_PARAM, "非法参数");
        }
        //检查消息是否存在
        Long messageId = secureIdConverterHelper.decodeMessageId(param.getMessageId());
        if (!messageRepository.existsByIdAndChatId(messageId, chatId)) {
            throw new BusinessException(ErrorCode.INVALID_PARAM, "非法参数");
        }

        MessageReadCursorId id = new MessageReadCursorId(param.getUserId(), chatId);
        if (messageReadCursorRepository.existsById(id)) {
            // 已存在，更新
            MessageReadCursor cursor = messageReadCursorRepository.findById(id).get();
            cursor.markRead(secureIdConverterHelper.decodeMessageId(param.getMessageId()));
            messageReadCursorRepository.save(cursor);
        } else {
            // 不存在，创建
            MessageReadCursor cursor = new MessageReadCursor(id, messageId);
            messageReadCursorRepository.save(cursor);
        }
    }

    @Override
    public String aiReply(String chatId, String userId) {
        List<MessageDO> messageDOS = messageMapper.getMessagesBefore(secureIdConverterHelper.decodeChatId(chatId),
                null, 10);
        List<SimpleMessageDTO> contexts = new ArrayList<>();
        for (int i = messageDOS.size() - 1; i >= 0; i--) {
            SimpleMessageDTO item = new SimpleMessageDTO();
            item.setSenderOpenId(messageDOS.get(i).getSender().getOpenId());
            item.setContent(messageDOS.get(i).getContent());
            contexts.add(item);
        }
        return aiAssistantService.messagesReply(contexts, userMapper.selectOpenIdById(userId));
    }
}
