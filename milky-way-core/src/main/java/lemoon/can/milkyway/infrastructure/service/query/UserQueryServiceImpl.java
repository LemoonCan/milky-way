package lemoon.can.milkyway.infrastructure.service.query;

import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.facade.dto.UserDTO;
import lemoon.can.milkyway.facade.dto.UserDetailDTO;
import lemoon.can.milkyway.facade.service.query.UserQueryService;
import lemoon.can.milkyway.infrastructure.converter.MomentConverter;
import lemoon.can.milkyway.infrastructure.converter.UserConverter;
import lemoon.can.milkyway.infrastructure.repository.dos.MomentDO;
import lemoon.can.milkyway.infrastructure.repository.dos.UserDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.MomentMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author lemoon
 * @since 2025/5/25
 */
@Service
@RequiredArgsConstructor
public class UserQueryServiceImpl implements UserQueryService {
    private final UserMapper userMapper;
    private final UserConverter userConverter;
    private final MomentMapper momentMapper;
    private final MomentConverter momentConverter;

    @Override
    public List<UserDTO> getAll() {
        List<UserDO> userDOList = userMapper.selectAll();
        return userDOList.stream()
                .map(userConverter::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SimpleUserDTO getById(String id) {
        return userMapper.selectSimpleById(id);
    }

    @Override
    public UserDetailDTO getUserDetailById(String id) {
        UserDO userDO = userMapper.selectUserById(id);
        UserDetailDTO userDetailDTO = userConverter.toUserInfoDTO(userDO);
        MomentDO momentDO = momentMapper.selectLastMomentByPublishUserId(id);
        userDetailDTO.setLastMoment(momentConverter.toMomentDescriptionDTO(momentDO));
        return userDetailDTO;
    }

    @Override
    public UserDTO getByOpenId(String openId) {
        UserDO userDO = userMapper.selectUserByOpenId(openId);
        return userConverter.toDTO(userDO);
    }

    @Override
    public UserDTO getByPhone(String phone) {
        UserDO userDO = userMapper.selectUserByPhone(phone);
        return userConverter.toDTO(userDO);
    }
}
