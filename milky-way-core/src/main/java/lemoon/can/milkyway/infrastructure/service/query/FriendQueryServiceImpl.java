package lemoon.can.milkyway.infrastructure.service.query;

import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.dto.FriendDTO;
import lemoon.can.milkyway.facade.dto.Slices;
import lemoon.can.milkyway.facade.param.FriendsQueryParam;
import lemoon.can.milkyway.facade.service.query.FriendQueryService;
import lemoon.can.milkyway.infrastructure.converter.FriendConverter;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendApplicationDO;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.FriendMapper;
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
    private final FriendMapper friendMapper;
    private final FriendConverter friendConverter;

    @Override
    public List<FriendApplicationDTO> getApplications(String toUserId) {
        List<FriendApplicationDO> list = friendMapper.findApplications(toUserId);
        return list.stream()
                .map(friendConverter::toDTO)
                .toList();
    }

    @Override
    public Slices<FriendDTO> getFriends(FriendsQueryParam param) {
        List<FriendDO> list = friendMapper.findFriends(param.getUserId(),
                param.getLastLetter(), param.getLastNickName(), param.getPageSize() + 1);
        boolean hasNext = list.size() > param.getPageSize();
        if(hasNext) {
            list.remove(list.size() - 1);
        }
        List<FriendDTO> friendDTOS = list.stream()
                .map(friendConverter::toDTO)
                .toList();
        return new Slices<>(friendDTOS, hasNext);
    }
}
