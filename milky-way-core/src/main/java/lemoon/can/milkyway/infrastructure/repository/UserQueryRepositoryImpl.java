package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.facade.dto.UserDTO;
import lemoon.can.milkyway.facade.repository.UserQueryRepository;
import org.springframework.stereotype.Repository;

/**
 * @author lemoon
 * @since 2025/4/27
 */
@Repository
public class UserQueryRepositoryImpl implements UserQueryRepository {

    @Override
    public UserDTO getByOpenId(String openId) {
        return null;
    }

    @Override
    public UserDTO getByPhone(String phone) {
        return null;
    }
}
