package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.common.enums.ChatType;
import lemoon.can.milkyway.common.enums.FriendApplyStatus;
import lemoon.can.milkyway.domain.friend.Friend;
import lemoon.can.milkyway.domain.friend.FriendApplication;
import lemoon.can.milkyway.domain.friend.FriendApplicationExtraInfo;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.facade.param.ChatCreateParam;
import lemoon.can.milkyway.facade.param.FriendApplyHandleParam;
import lemoon.can.milkyway.facade.param.FriendApplyParam;
import lemoon.can.milkyway.facade.service.command.ChatService;
import lemoon.can.milkyway.facade.service.command.FriendService;
import lemoon.can.milkyway.infrastructure.repository.FriendApplicationRepository;
import lemoon.can.milkyway.infrastructure.repository.FriendRepository;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/5/12
 */
@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {
    private final UserRepository userRepository;
    private final FriendApplicationRepository friendApplicationRepository;
    private final FriendRepository friendRepository;
    private final SecureId secureId;
    private final ChatService chatService;

    @Override
    @Transactional
    public void addFriend(FriendApplyParam param) {
        FriendApplication friendApplication = new FriendApplication(param.getFromUserId(),
                param.getToUserId(),
                param.getApplyMessage());
        friendApplication.setExtraInfo(new FriendApplicationExtraInfo(
                param.getExtraInfo().getRemark(),
                param.getExtraInfo().getPermission()
        ));
        friendApplicationRepository.save(friendApplication);

        //TODO 1.推送给申请的好友通知
    }

    @Override
    @Transactional
    public void handleApplication(FriendApplyHandleParam param) {
        String userId = param.getUserId();
        Long id = secureId.decode(param.getFriendApplicationId(), secureId.getFriendApplicationSalt());
        //申请处理
        FriendApplication friendApplication = friendApplicationRepository.findById(id).orElseThrow();
        if (!friendApplication.getToUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNSUPPORTED, "申请不匹配");
        }
        friendApplication.handle(param.getStatus());
        friendApplicationRepository.save(friendApplication);

        if( param.getStatus() == FriendApplyStatus.REJECTED) {
            return;
        }
        //建立好友关系
        Friend friend1 = new Friend(friendApplication.getFromUserId(), friendApplication.getToUserId());
        friend1.setExtra(friendApplication.getExtraInfo().getRemark(), friendApplication.getExtraInfo().getPermission());
        Friend friend2 = new Friend(friendApplication.getToUserId(), friendApplication.getFromUserId());
        friend2.setExtra(param.getExtraInfo().getRemark(), param.getExtraInfo().getPermission());

        friendRepository.save(friend1);
        friendRepository.save(friend2);

        //1.创建单聊
        ChatCreateParam chatCreateParam = new ChatCreateParam();
        chatCreateParam.setChatType(ChatType.SINGLE);
        chatCreateParam.setMembers(List.of(
                friendApplication.getFromUserId(),
                friendApplication.getToUserId()));
        chatService.createChat(chatCreateParam);

        //TODO 推送给申请用户结果
    }
}
