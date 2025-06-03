package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.share.Post;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author lemoon
 * @since 2025/6/3
 */
public interface PostRepository extends JpaRepository<Post, Long> {
}
