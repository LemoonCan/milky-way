package lemoon.can.milkyway.domain.share;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lemoon.can.milkyway.common.enums.PostContentType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author lemoon
 * @since 2025/6/3
 */
@Entity
@NoArgsConstructor
@Getter
public class Post {
    /**
     * 主键
     */
    @Id
    private Long id;
    /**
     * 内容类型
     */
    @Enumerated(EnumType.STRING)
    private PostContentType contentType;
    /**
     * 文字内容
     */
    private String text;
    /**
     * 媒体内容
     */
    private List<String> medias;
    private String location;
    /**
     * 点赞数
     */
    private Integer likeCounts;
    /**
     * 评论数
     */
    private Integer commentCounts;
}
