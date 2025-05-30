package lemoon.can.milkyway.infrastructure.service.query;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.dto.FriendDTO;
import lemoon.can.milkyway.facade.service.query.FriendQueryService;
import lemoon.can.milkyway.infrastructure.converter.FriendConverter;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendApplicationDO;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendDO;
import lemoon.can.milkyway.infrastructure.repository.query.FriendQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/14
 */
@Service
@RequiredArgsConstructor
public class FriendQueryServiceImpl implements FriendQueryService {
    private final UserRepository userRepository;
    private final FriendQueryRepository friendQueryRepository;
    private final FriendConverter friendConverter;
    private final SecureId secureId;

    @Override
    public List<FriendApplicationDTO> getApplications(String toUserId) {
        List<FriendApplicationDO> list = friendQueryRepository.findApplications(toUserId);
        return list.stream()
                .map(friendConverter::toDTO)
                .toList();
    }

    @Override
    public List<FriendDTO> getFriends(String userId) {
        List<FriendDO> list = friendQueryRepository.findFriends(userId);
        return list.stream()
                .map(friendConverter::toDTO)
                .toList();
    }
}
