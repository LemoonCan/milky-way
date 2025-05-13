package lemoon.can.milkyway.facade.query;

import lemoon.can.milkyway.facade.dto.UserDTO;

/**
 * @author lemoon
 * @since 2025/4/27
 */
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
