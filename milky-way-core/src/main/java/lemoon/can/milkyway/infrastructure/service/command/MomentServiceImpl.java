package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.share.Comment;
import lemoon.can.milkyway.domain.share.Like;
import lemoon.can.milkyway.domain.share.LikeId;
import lemoon.can.milkyway.domain.share.Moment;
import lemoon.can.milkyway.facade.param.CommentParam;
import lemoon.can.milkyway.facade.param.PublishParam;
import lemoon.can.milkyway.facade.service.command.MomentService;
import lemoon.can.milkyway.infrastructure.repository.CommentRepository;
import lemoon.can.milkyway.infrastructure.repository.LikeRepository;
import lemoon.can.milkyway.infrastructure.repository.MomentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Objects;

/**
 * @author lemoon
 * @since 2025/6/5
 */
@Service
@RequiredArgsConstructor
public class MomentServiceImpl implements MomentService {
    private final MomentRepository momentRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final SecureId secureId;

    @Transactional
    @Override
    public String publish(PublishParam param) {
        Moment moment = new Moment(param.getContentType(), param.getText(), param.getMedias(), param.getPublishUserId());
        moment.setLocation(param.getLocation());
        momentRepository.save(moment);
        return secureId.simpleEncode(moment.getId(), secureId.getMomentSalt());
    }

    @Transactional
    @Override
    public void delete(String momentId) {
        Long realMomentId = secureId.simpleDecode(momentId, secureId.getMomentSalt());
        momentRepository.deleteById(realMomentId);
        commentRepository.deleteByMomentId(realMomentId);
        likeRepository.deleteByMomentId(realMomentId);
    }

    @Transactional
    @Override
    public void like(String momentId, String userId) {
        Long realMomentId = secureId.simpleDecode(momentId, secureId.getMomentSalt());
        Moment moment = momentRepository.findById(realMomentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "内容不存在"));
        if (likeRepository.findById(new LikeId(realMomentId, userId)).isPresent()) {
            return;
        }

        moment.addLike();
        momentRepository.save(moment);

        Like like = new Like(realMomentId, userId);
        likeRepository.save(like);
    }

    @Transactional
    @Override
    public void unlike(String momentId, String userId) {
        Long realMomentId = secureId.simpleDecode(momentId, secureId.getMomentSalt());
        Moment moment = momentRepository.findById(realMomentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "内容不存在"));
        if (likeRepository.findById(new LikeId(realMomentId, userId)).isEmpty()) {
            return;
        }
        moment.removeLike();
        momentRepository.save(moment);
        likeRepository.deleteById(new LikeId(realMomentId, userId));
    }

    @Transactional
    @Override
    public void comment(CommentParam param) {
        Long realMomentId = secureId.simpleDecode(param.getMomentId(), secureId.getMomentSalt());
        Comment comment = new Comment(realMomentId, param.getCommentUserId(), param.getContent());
        comment.setParentCommentId(param.getParentCommentId());

        commentRepository.save(comment);
    }
}
