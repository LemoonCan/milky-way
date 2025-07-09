package lemoon.can.milkyway.facade.service.query;

import lemoon.can.milkyway.facade.dto.SimpleUserDTO;
import lemoon.can.milkyway.facade.dto.UserDTO;
import lemoon.can.milkyway.facade.dto.UserDetailDTO;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/25
 */
public interface UserQueryService {
    List<UserDTO> getAll();

    SimpleUserDTO getById(String id);

    UserDetailDTO getUserDetailById(String id);

    UserDTO getByOpenId(String openId);

    UserDTO getByPhone(String phone);
}
