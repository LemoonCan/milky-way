package lemoon.can.milkyway.infrastructure.repository.query;

import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Mapper
public interface FriendQueryRepository {
    List<FriendApplicationDTO> findApplications(String toUserOpenId);
}
