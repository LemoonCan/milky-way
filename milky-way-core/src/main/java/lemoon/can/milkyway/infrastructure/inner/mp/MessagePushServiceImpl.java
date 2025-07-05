package lemoon.can.milkyway.infrastructure.inner.mp;

import lemoon.can.milkyway.common.enums.MessageNotifyType;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.friend.FriendApplication;
import lemoon.can.milkyway.domain.share.Comment;
import lemoon.can.milkyway.domain.share.Like;
import lemoon.can.milkyway.domain.share.Moment;
import lemoon.can.milkyway.facade.dto.*;
import lemoon.can.milkyway.infrastructure.converter.MomentConverter;
import lemoon.can.milkyway.infrastructure.inner.MessageDestination;
import lemoon.can.milkyway.infrastructure.repository.mapper.FriendMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.MomentMapper;
import lemoon.can.milkyway.infrastructure.repository.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

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
    private final MomentConverter momentConverter;
    private final FriendMapper friendMapper;

    @Override
    public void friendApplyMsg(FriendApplication friendApplication) {
        //点对点
        MessageNotifyDTO<FriendApplicationContentDTO> payload = new MessageNotifyDTO<>();
        FriendApplicationContentDTO content = new FriendApplicationContentDTO();
        content.setId(secureId.simpleEncode(friendApplication.getId(), secureId.getFriendApplicationSalt()));
        content.setStatus(friendApplication.getStatus());
        content.setApplyMsg(friendApplication.getApplyMsg());
        content.setFromUser(userMapper.selectSimpleById(friendApplication.getFromUserId()));
        content.setCreateTime(friendApplication.getCreateTime().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        payload.setNotifyType(MessageNotifyType.FRIEND_APPLY);
        payload.setContent(content);

        messagingTemplate.convertAndSendToUser(friendApplication.getToUserId(),
                MessageDestination.NOTIFY_DEST, payload);
    }

    @Override
    public void momentMsg(Moment moment) {
        MessageNotifyDTO<MomentDTO> payload = new MessageNotifyDTO<>();
        payload.setNotifyType(MessageNotifyType.MOMENT_CREATE);
        MomentDTO momentDTO = momentConverter.toMomentDTO(moment);
        SimpleUserDTO user = userMapper.selectSimpleById(moment.getPublishUserId());
        momentDTO.setUser(user);
        momentDTO.setLikeUsers(List.of());
        momentDTO.setComments(List.of());
        payload.setContent(momentDTO);

        List<String> friends = friendMapper.selectFriendIds(moment.getPublishUserId());
        for (String friendId : friends) {
            messagingTemplate.convertAndSendToUser(friendId, MessageDestination.NOTIFY_DEST, payload);
        }
    }

    @Override
    public void likeMsg(Like like) {
        //点对点
        String user = momentMapper.selectPublishUserIdById(like.getMomentId());
        MessageNotifyDTO<LikeDTO> payload = new MessageNotifyDTO<>();
        LikeDTO content = new LikeDTO();
        content.setMomentId(secureId.simpleEncode(like.getMomentId(), secureId.getMomentSalt()));
        content.setLikeUser(userMapper.selectSimpleById(like.getLikeUserId()));
        content.setCreateTime(like.getCreateTime().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        payload.setNotifyType(MessageNotifyType.LIKE);
        payload.setContent(content);

        messagingTemplate.convertAndSendToUser(user, MessageDestination.NOTIFY_DEST, payload);
    }

    @Override
    public void commentMsg(Comment comment) {
        //点对点
        String user = momentMapper.selectPublishUserIdById(comment.getMomentId());
        MessageNotifyDTO<CommentContentDTO> payload = new MessageNotifyDTO<>();
        CommentContentDTO content = new CommentContentDTO();
        content.setMomentId(secureId.simpleEncode(comment.getMomentId(), secureId.getMomentSalt()));
        content.setContent(comment.getContent());
        content.setCreateTime(comment.getCreateTime().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        payload.setNotifyType(MessageNotifyType.COMMENT);
        payload.setContent(content);

        messagingTemplate.convertAndSendToUser(user, MessageDestination.NOTIFY_DEST, payload);
    }
}
