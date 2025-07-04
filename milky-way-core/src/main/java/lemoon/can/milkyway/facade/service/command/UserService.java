package lemoon.can.milkyway.facade.service.command;

import lemoon.can.milkyway.facade.dto.UserDTO;
import lemoon.can.milkyway.facade.param.UserChangePasswordParam;
import lemoon.can.milkyway.facade.param.UserOpenIdLoginParam;
import lemoon.can.milkyway.facade.param.UserPhoneLoginParam;
import lemoon.can.milkyway.facade.param.UserRegisterParam;

/**
 * @author lemoon
 * @since 2025/4/25
 */
public interface UserService {
    /**
     * 用户注册
     * @param param 注册参数
     */
    void register(UserRegisterParam param);

    /**
     * 变更用户密码
     * @param param 变更密码参数
     */
    void changePassword(UserChangePasswordParam param);

    /**
     * 变更用户信息
     * @param param 用户信息
     */
    void changeInfo(UserDTO param);

    /**
     * 用户账号登录
     * @param param
     * @return
     */
    String loginByOpenId(UserOpenIdLoginParam param);

    /**
     * 用户手机登录
     * @param param 登录参数
     */
    String loginByPhone(UserPhoneLoginParam param);

    /**
     * 用户登出
     * @param id 用户Id
     */
    void logout(String id);
}
