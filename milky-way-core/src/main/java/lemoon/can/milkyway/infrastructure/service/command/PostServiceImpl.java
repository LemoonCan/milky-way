package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.share.Comment;
import lemoon.can.milkyway.domain.share.Like;
import lemoon.can.milkyway.domain.share.LikeId;
import lemoon.can.milkyway.domain.share.Post;
import lemoon.can.milkyway.facade.param.CommentParam;
import lemoon.can.milkyway.facade.param.PublishParam;
import lemoon.can.milkyway.facade.service.command.PostService;
import lemoon.can.milkyway.infrastructure.repository.CommentRepository;
import lemoon.can.milkyway.infrastructure.repository.LikeRepository;
import lemoon.can.milkyway.infrastructure.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * @author lemoon
 * @since 2025/6/5
 */
@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final SecureId secureId;

    @Transactional
    @Override
    public String publish(PublishParam param) {
        Post post = new Post(param.getContentType(), param.getText(), param.getMedias());
        post.setLocation(param.getLocation());
        postRepository.save(post);
        return secureId.encode(post.getId(), secureId.getPostSalt());
    }

    @Transactional
    @Override
    public void delete(String postId) {
        Long realPostId = secureId.decode(postId, secureId.getPostSalt());
        postRepository.deleteById(realPostId);
        commentRepository.deleteByPostId(realPostId);
        likeRepository.deleteByPostId(realPostId);
    }

    @Transactional
    @Override
    public void like(String postId, String userId) {
        Long realPostId = secureId.decode(postId, secureId.getPostSalt());
        Post post = postRepository.findById(realPostId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "内容不存在"));
        if (likeRepository.findById(new LikeId(realPostId, userId)).isPresent()) {
            return;
        }

        post.addLike();
        postRepository.save(post);

        Like like = new Like(realPostId, userId);
        likeRepository.save(like);
    }

    @Transactional
    @Override
    public void unlike(String postId, String userId) {
        Long realPostId = secureId.decode(postId, secureId.getPostSalt());
        Post post = postRepository.findById(realPostId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "内容不存在"));
        if (likeRepository.findById(new LikeId(realPostId, userId)).isEmpty()) {
            return;
        }
        post.removeLike();
        postRepository.save(post);
        likeRepository.deleteById(new LikeId(realPostId, userId));
    }

    @Transactional
    @Override
    public String comment(CommentParam param) {
        Long realPostId = secureId.decode(param.getPostId(), secureId.getPostSalt());
        Comment comment = new Comment(realPostId, param.getCommentUserId(), param.getContent());
        if (StringUtils.hasLength(param.getParentCommentId())) {
            comment.setParentCommentId(secureId.decode(param.getParentCommentId(), secureId.getCommentSalt()));
        }
        commentRepository.save(comment);
        return secureId.encode(comment.getId(), secureId.getCommentSalt());
    }
}
