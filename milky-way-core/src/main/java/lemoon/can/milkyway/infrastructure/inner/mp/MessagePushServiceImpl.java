package lemoon.can.milkyway.infrastructure.inner.mp;

import lemoon.can.milkyway.common.enums.MessageNotifyType;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.friend.Friend;
import lemoon.can.milkyway.domain.friend.FriendApplication;
import lemoon.can.milkyway.domain.share.Comment;
import lemoon.can.milkyway.domain.share.Like;
import lemoon.can.milkyway.domain.share.Moment;
import lemoon.can.milkyway.facade.dto.*;
import lemoon.can.milkyway.infrastructure.converter.MomentConverter;
import lemoon.can.milkyway.infrastructure.inner.MessageDestination;
import lemoon.can.milkyway.infrastructure.repository.dos.MomentDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.CommentMapper;
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
    private final CommentMapper commentMapper;

    @Override
    public void friendApplyMsg(FriendApplication friendApplication) {
        //点对点
        MessageNotifyDTO<FriendApplicationDTO> payload = new MessageNotifyDTO<>();
        FriendApplicationDTO content = new FriendApplicationDTO();
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
    public void newFriendMsg(Friend friend) {
        MessageNotifyDTO<FriendDTO> payload = new MessageNotifyDTO<>();
        payload.setNotifyType(MessageNotifyType.NEW_FRIEND);
        FriendDTO content = new FriendDTO();
        content.setRemark(friend.getRemark());
        content.setFriend(userMapper.selectSimpleById(friend.getId().getFriendId()));
        content.setStatus(friend.getStatus());
        content.setPermission(friend.getPermission());
        payload.setContent(content);
        messagingTemplate.convertAndSendToUser(friend.getId().getUserId(),
                MessageDestination.NOTIFY_DEST, payload);
    }

    @Override
    public void momentCreateMsg(Moment moment) {
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
    public void momentDeleteMsg(String momentId, String publishUserId) {
        MessageNotifyDTO<String> payload = new MessageNotifyDTO<>();
        payload.setNotifyType(MessageNotifyType.MOMENT_DELETE);
        payload.setContent(momentId);
        List<String> friends = friendMapper.selectFriendIds(publishUserId);
        for (String friendId : friends) {
            messagingTemplate.convertAndSendToUser(friendId, MessageDestination.NOTIFY_DEST, payload);
        }
    }

    @Override
    public void likeMsg(Like like) {
        //点对点
        String momentPublishUserId = momentMapper.selectPublishUserIdById(like.getMomentId());
        MessageNotifyDTO<LikeDTO> payload = new MessageNotifyDTO<>();
        LikeDTO content = new LikeDTO();
        MomentDO momentDO = momentMapper.getMomentDescriptionById(like.getMomentId());
        content.setMomentDescription(momentConverter.toMomentDescriptionDTO(momentDO));
        content.setUser(userMapper.selectSimpleById(like.getLikeUserId()));
        content.setCreateTime(like.getCreateTime().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        payload.setNotifyType(MessageNotifyType.LIKE);
        payload.setContent(content);

        if( !like.getLikeUserId().equals(momentPublishUserId)) {
            //如果点赞用户不是动态发布者，则发送给动态发布者
            messagingTemplate.convertAndSendToUser(momentPublishUserId, MessageDestination.NOTIFY_DEST, payload);
        }
    }

    @Override
    public void unlikeMsg(UnlikeDTO unlikeDTO) {
        MessageNotifyDTO<UnlikeDTO> payload = new MessageNotifyDTO<>();
        payload.setNotifyType(MessageNotifyType.UNLIKE);
        payload.setContent(unlikeDTO);
        if(!unlikeDTO.getUserId().equals(unlikeDTO.getPublishUserId())) {
            //如果取消点赞用户不是动态发布者，则发送给动态发布者
            messagingTemplate.convertAndSendToUser(unlikeDTO.getPublishUserId(), MessageDestination.NOTIFY_DEST, payload);
        }
    }

    @Override
    public void commentMsg(Comment comment) {
        //点对点
        String momentPublishUserId = momentMapper.selectPublishUserIdById(comment.getMomentId());
        MessageNotifyDTO<CommentWithMomentDTO> payload = new MessageNotifyDTO<>();
        payload.setNotifyType(MessageNotifyType.COMMENT);
        CommentWithMomentDTO content = new CommentWithMomentDTO();
        payload.setContent(content);
        content.setId(comment.getId());
        MomentDO momentDO = momentMapper.getMomentDescriptionById(comment.getMomentId());
        content.setMomentDescription(momentConverter.toMomentDescriptionDTO(momentDO));
        content.setParentCommentId(comment.getParentCommentId());
        content.setUser(userMapper.selectSimpleById(comment.getCommentUserId()));
        content.setContent(comment.getContent());
        content.setCreateTime(comment.getCreateTime().format(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

        if (comment.getParentCommentId() != null) {
            SimpleUserDTO replyUser = commentMapper.selectReplyUser(comment.getParentCommentId());
            if(replyUser.getId().equals(content.getUser().getId())){
                return;
            }
            content.setReplyUser(replyUser);
            messagingTemplate.convertAndSendToUser(replyUser.getId(), MessageDestination.NOTIFY_DEST, payload);
        }

        if (!comment.getCommentUserId().equals(momentPublishUserId)) {
            messagingTemplate.convertAndSendToUser(momentPublishUserId, MessageDestination.NOTIFY_DEST, payload);
        }
    }
}
