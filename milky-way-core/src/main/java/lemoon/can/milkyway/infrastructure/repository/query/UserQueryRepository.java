package lemoon.can.milkyway.infrastructure.repository.query;

import lemoon.can.milkyway.facade.dto.UserDTO;
import org.apache.ibatis.annotations.Mapper;

/**
 * @author lemoon
 * @since 2025/4/27
 */
@Mapper
public interface UserQueryRepository {
    /**
     * 通过openId匹配用户
     * @param openId 开放Id
     * @return 用户信息
     */
    UserDTO getByOpenId(String openId);

    /**
     * 通过手机号匹配用户
     * @param phone 手机号
     * @return 用户信息
     */
    UserDTO getByPhone(String phone);
}
