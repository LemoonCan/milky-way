package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.share.Comment;
import org.springframework.data.repository.CrudRepository;

/**
 * @author lemoon
 * @since 2025/6/3
 */
public interface CommentRepository extends CrudRepository<Comment, Long> {
    void deleteByPostId(Long postId);
}
