package lemoon.can.milkyway.infrastructure.service;

import lemoon.can.milkyway.domain.friend.FriendApplication;
import lemoon.can.milkyway.facade.exception.BusinessException;
import lemoon.can.milkyway.facade.exception.ErrorCode;
import lemoon.can.milkyway.facade.param.FriendApplyHandleParam;
import lemoon.can.milkyway.facade.param.FriendApplyParam;
import lemoon.can.milkyway.facade.service.FriendService;
import lemoon.can.milkyway.infrastructure.repository.FriendApplicationRepository;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lemoon.can.milkyway.utils.security.SecureId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author lemoon
 * @since 2025/5/12
 */
@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {
    private final UserRepository userRepository;
    private final FriendApplicationRepository friendApplicationRepository;
    private final SecureId secureId;

    @Override
    @Transactional
    public void addFriend(FriendApplyParam param) {
        Long fromUserId = userRepository.findIdByOpenId(param.getFromOpenId());
        Long toUserId = userRepository.findIdByOpenId(param.getToOpenId());
        FriendApplication friendApplication = new FriendApplication(fromUserId, toUserId, param.getApplyMessage());
        friendApplicationRepository.save(friendApplication);
    }

    @Override
    @Transactional
    public void handleApplication(FriendApplyHandleParam param) {
        Long userId = userRepository.findIdByOpenId(param.getOpenId());
        Long id = secureId.decode(param.getFriendApplicationId());
        //申请处理
        FriendApplication friendApplication = friendApplicationRepository.findById(id).orElseThrow();
        if (!friendApplication.getToUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNSUPPORTED, "申请不匹配");
        }
        friendApplication.handle(param.getStatus());
        friendApplicationRepository.save(friendApplication);

        //TODO 建立好友关系
    }
}
