package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.common.utils.security.JwtTokenProvider;
import lemoon.can.milkyway.domain.user.LoginInfo;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.UserDTO;
import lemoon.can.milkyway.facade.param.UserChangePasswordParam;
import lemoon.can.milkyway.facade.param.UserOpenIdLoginParam;
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
import org.springframework.util.StringUtils;

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

    @Transactional
    @Override
    public void register(UserRegisterParam param) {
        if (StringUtils.hasLength(param.getOpenId())) {
            if (userRepository.existsByOpenId(param.getOpenId())) {
                throw new BusinessException(ErrorCode.INVALID_PARAM, "账号已存在");
            }
        }
        User user = new User(param.getOpenId(), param.getPhone(), passwordEncoder.encode(param.getPassword()));
        user.changeInfo(param.getNickName(), param.getAvatar(), param.getIndividualSignature());
        userRepository.save(user);
    }

    @Transactional
    @Override
    public void changePassword(UserChangePasswordParam param) {
        User user = userRepository.findByPhone(param.getPhone())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_PARAM, "用户不存在"));
        user.changePassword(passwordEncoder.encode(param.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void changeInfo(UserDTO param) {
        User user = userRepository.findById(param.getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_PARAM, "用户不存在"));
        if(!user.getOpenId().equals(param.getOpenId())) {
            if (userRepository.existsByOpenId(param.getOpenId())) {
                throw new BusinessException(ErrorCode.INVALID_PARAM, "账号已存在");
            }
        }
        user.changeOpenId(param.getOpenId());
        user.changeInfo(param.getNickName(), param.getAvatar(), param.getIndividualSignature());
        userRepository.save(user);
    }

    @Override
    public String loginByOpenId(UserOpenIdLoginParam param) {
        User user = userRepository.findByOpenId(param.getOpenId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "账号不存在"));

        return login(param.getPassword(), user);
    }

    @Transactional
    @Override
    public String loginByPhone(UserPhoneLoginParam param) {
        User user = userRepository.findByPhone(param.getPhone())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "账号不存在"));

        return login(param.getPassword(), user);
    }

    private String login(String password, User user) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getId(), password));

        String token = jwtTokenProvider.createToken(authentication);

        LoginInfo loginInfo = LoginInfo.builder()
                .logged(1)
                .lastLoginTime(LocalDateTime.now())
                .lastLoginToken(token)
                .build();
        user.login(loginInfo);
        userRepository.save(user);

        return token;
    }

    @Transactional
    @Override
    public void logout(String id) {
        User user = userRepository.findById(id)
                .orElseThrow();
        user.logout();
        userRepository.save(user);
    }
}
