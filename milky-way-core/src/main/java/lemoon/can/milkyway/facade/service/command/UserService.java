package lemoon.can.milkyway.facade.service.command;

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
     * 用户手机登录
     * @param param 登录参数
     */
    String loginByPhone(UserPhoneLoginParam param);

    void logout(String id);
}
