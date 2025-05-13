package lemoon.can.milkyway.facade.query;

import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/13
 */
public interface FriendQueryRepository {
    List<FriendApplicationDTO> findApplications(String toUserOpenId);
}
