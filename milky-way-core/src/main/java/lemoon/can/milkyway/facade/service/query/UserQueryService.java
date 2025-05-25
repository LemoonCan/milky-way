package lemoon.can.milkyway.facade.service.query;

import lemoon.can.milkyway.facade.dto.UserDTO;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/25
 */
public interface UserQueryService {
    List<UserDTO> getAll();
}
