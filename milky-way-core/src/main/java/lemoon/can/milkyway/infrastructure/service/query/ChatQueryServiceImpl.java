package lemoon.can.milkyway.infrastructure.service.query;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.facade.service.query.ChatQueryService;
import lemoon.can.milkyway.infrastructure.repository.mapper.ChatMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/6/10
 */
@Service
@RequiredArgsConstructor
public class ChatQueryServiceImpl implements ChatQueryService {
    private final ChatMapper chatMapper;
    private final SecureId secureId;

    @Override
    public List<String> getGroupChats(String userId) {
        return chatMapper.findGroupChats(userId).stream()
                .map(item->
                        secureId.simpleEncode(item,secureId.getChatSalt()))
                .toList();
    }
}
