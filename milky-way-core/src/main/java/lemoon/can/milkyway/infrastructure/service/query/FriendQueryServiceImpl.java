package lemoon.can.milkyway.infrastructure.service.query;

import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.service.query.FriendQueryService;
import lemoon.can.milkyway.infrastructure.mapper.FriendMapper;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendApplicationDO;
import lemoon.can.milkyway.infrastructure.repository.query.FriendApplicationQueryRepository;
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
    private final FriendApplicationQueryRepository friendApplicationQueryRepository;
    private final FriendMapper friendMapper;

    @Override
    public List<FriendApplicationDTO> getApplications(String toUserOpenId) {
        Long toUserId = userRepository.findIdByOpenId(toUserOpenId);
        List<FriendApplicationDO> list = friendApplicationQueryRepository.findApplications(toUserId);
        return list.stream()
                .map(friendMapper::toDTO)
                .toList();
    }
}
