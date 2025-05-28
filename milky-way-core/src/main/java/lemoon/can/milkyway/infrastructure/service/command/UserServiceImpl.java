package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.common.utils.security.JwtTokenProvider;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.user.LoginInfo;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.param.UserChangePasswordParam;
import lemoon.can.milkyway.facade.param.UserPhoneLoginParam;
import lemoon.can.milkyway.facade.param.UserRegisterParam;
import lemoon.can.milkyway.facade.service.command.UserService;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * @author lemoon
 * @since 2025/4/25
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final SecureId secureId;

    @Transactional
    @Override
    public void register(UserRegisterParam param) {
        User user = new User(param.getOpenId(), param.getPhone(), passwordEncoder.encode(param.getPassword()));
        user.changeInfo(param.getNickName(), param.getAvatar(), param.getIndividualSignature());
        userRepository.save(user);
    }

    @Override
    public void changePassword(UserChangePasswordParam param) {
        User user = userRepository.findByPhone(param.getPhone()).orElseThrow();
        user.changePassword(passwordEncoder.encode(param.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    @Override
    public String loginByPhone(UserPhoneLoginParam param) {
        User user = userRepository.findByPhone(param.getPhone()).orElseThrow();
        String userId = secureId.encode(user.getId(), secureId.getUserSalt());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userId, param.getPassword()));

        LoginInfo loginInfo = LoginInfo.builder()
                .online(1)
                .lastLoginTime(LocalDateTime.now())
                .build();
        user.login(loginInfo);
        userRepository.save(user);
        return jwtTokenProvider.createToken(authentication);
    }

    @Transactional
    @Override
    public void logout(String id) {
        User user = userRepository.findById(secureId.decode(id, secureId.getUserSalt()))
                .orElseThrow();
        user.logout();
        userRepository.save(user);
    }
}
