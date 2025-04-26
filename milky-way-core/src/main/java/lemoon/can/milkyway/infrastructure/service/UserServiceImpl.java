package lemoon.can.milkyway.infrastructure.service;

import lemoon.can.milkyway.facade.param.UserPhoneLoginParam;
import lemoon.can.milkyway.facade.param.UserRegisterParam;
import lemoon.can.milkyway.facade.service.UserService;
import org.springframework.stereotype.Service;

/**
 * @author lemoon
 * @since 2025/4/25
 */
@Service
public class UserServiceImpl implements UserService {
    @Override
    public void register(UserRegisterParam param) {

    }

    @Override
    public void loginByPhone(UserPhoneLoginParam param) {

    }

    @Override
    public void logout(String openId) {

    }
}
