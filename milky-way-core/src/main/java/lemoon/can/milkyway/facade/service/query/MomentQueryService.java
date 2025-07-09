package lemoon.can.milkyway.facade.service.query;

import lemoon.can.milkyway.facade.dto.MomentDTO;
import lemoon.can.milkyway.facade.dto.Slices;

/**
 * @author lemoon
 * @since 2025/6/5
 */
public interface MomentQueryService {
    /**
     * 查询用户动态(评论全部查出)
     * @param userId
     * @param lastId
     * @param pageSize
     * @return
     */
    Slices<MomentDTO> listFriendMoments(String userId, String lastId, int pageSize);

    /**
     * 查询个人动态(评论全部查出)
     * @param userId
     * @param lastId
     * @param pageSize
     * @return
     */
    Slices<MomentDTO> listPersonalMoments(String userId, String lastId, int pageSize);
}
