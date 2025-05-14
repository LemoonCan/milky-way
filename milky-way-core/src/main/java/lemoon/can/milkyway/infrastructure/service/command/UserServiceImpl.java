package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.utils.security.JwtTokenProvider;
import lemoon.can.milkyway.domain.user.User;
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

    @Override
    @Transactional
    public void register(UserRegisterParam param) {
        User user = new User(param.getOpenId(), param.getPhone(), passwordEncoder.encode(param.getPassword()));
        user.changeInfo(param.getNickName(), param.getAvatar(), param.getIndividualSignature());
        userRepository.save(user);
    }

    @Override
    public String loginByPhone(UserPhoneLoginParam param) {
        User user = userRepository.findByPhone(param.getPhone()).orElseThrow();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getOpenId(), param.getPassword()));
        return jwtTokenProvider.createToken(authentication);
    }
}
