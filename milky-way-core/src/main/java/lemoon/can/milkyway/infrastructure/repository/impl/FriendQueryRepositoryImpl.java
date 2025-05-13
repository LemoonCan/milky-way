package lemoon.can.milkyway.infrastructure.repository.impl;

import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.query.FriendQueryRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Repository
public class FriendQueryRepositoryImpl implements FriendQueryRepository {
    @Override
    public List<FriendApplicationDTO> findApplications(String toUserOpenId) {
        return List.of();
    }
}
