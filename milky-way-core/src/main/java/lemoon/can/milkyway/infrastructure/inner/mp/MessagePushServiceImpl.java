package lemoon.can.milkyway.infrastructure.inner.mp;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.friend.FriendApplication;
import lemoon.can.milkyway.domain.share.Comment;
import lemoon.can.milkyway.domain.share.Like;
import lemoon.can.milkyway.facade.dto.CommentContentDTO;
import lemoon.can.milkyway.facade.dto.FriendApplicationContentDTO;
import lemoon.can.milkyway.facade.dto.LikeContentDTO;
import lemoon.can.milkyway.infrastructure.repository.mapper.MomentMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * @author lemoon
 * @since 2025/6/11
 */
@Service
@RequiredArgsConstructor
public class MessagePushServiceImpl implements MessagePushService {
    private final SimpMessagingTemplate messagingTemplate;
    private final UserMapper userMapper;
    private final SecureId secureId;
    private final MomentMapper momentMapper;

    @Override
    public void friendApplyMsg(FriendApplication friendApplication) {
        //点对点
        FriendApplicationContentDTO payload = new FriendApplicationContentDTO();
        payload.setId(secureId.encode(friendApplication.getId(), secureId.getFriendApplicationSalt()));
        payload.setStatus(friendApplication.getStatus());
        payload.setApplyMsg(friendApplication.getApplyMsg());
        payload.setFromUser(userMapper.selectSimpleById(friendApplication.getFromUserId()));
        payload.setCreateTime(friendApplication.getCreateTime().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        messagingTemplate.convertAndSendToUser(friendApplication.getToUserId(),
                "/queue/friendApplications", payload);
    }

    @Override
    public void likeMsg(Like like) {
        //点对点
        String user = momentMapper.selectPublishUserIdById(like.getMomentId());
        LikeContentDTO payload = new LikeContentDTO();
        payload.setMomentId(secureId.simpleEncode(like.getMomentId(), secureId.getMomentSalt()));
        payload.setLikeUser(userMapper.selectSimpleById(like.getLikeUserId()));
        payload.setCreateTime(like.getCreateTime().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        messagingTemplate.convertAndSendToUser(user,
                "/queue/momentLikes", payload);
    }

    @Override
    public void commentMsg(Comment comment) {
        //点对点
        String user = momentMapper.selectPublishUserIdById(comment.getMomentId());
        CommentContentDTO payload = new CommentContentDTO();
        payload.setMomentId(secureId.simpleEncode(comment.getMomentId(), secureId.getMomentSalt()));
        payload.setContent(comment.getContent());
        payload.setCreateTime(comment.getCreateTime().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        messagingTemplate.convertAndSendToUser(user,
                "/queue/momentComments", payload);
    }
}
