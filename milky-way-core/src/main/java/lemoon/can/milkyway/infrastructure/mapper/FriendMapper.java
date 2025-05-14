package lemoon.can.milkyway.infrastructure.mapper;

import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendApplicationDO;
import lemoon.can.milkyway.utils.security.SecureId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * @author lemoon
 * @since 2025/5/14
 */
@Component
@RequiredArgsConstructor
public class FriendMapper {
    private final SecureId secureId;
    private final UserMapper userMapper;
    public FriendApplicationDTO toDTO(FriendApplicationDO friendApplicationDO) {
        if (friendApplicationDO == null) {
            return null;
        }
        FriendApplicationDTO dto = new FriendApplicationDTO();
        dto.setId(secureId.encode(friendApplicationDO.getId()));
        dto.setApplyMsg(friendApplicationDO.getApplyMsg());
        dto.setFromUser(userMapper.toDTO(friendApplicationDO.getFromUser()));
        dto.setToUser(userMapper.toDTO(friendApplicationDO.getToUser()));
        return dto;
    }
}
