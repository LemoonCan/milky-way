package lemoon.can.milkyway.domain.share;

import jakarta.persistence.*;
import lemoon.can.milkyway.common.enums.PostContentType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> medias;
    /**
     * 发布者位置
     */
    @Setter
    private String location;
    /**
     * 点赞数
     */
    private Integer likeCounts = 0;
    /**
     * 评论数
     */
    private Integer commentCounts = 0;

    public Post(PostContentType contentType, String text, List<String> medias) {
        this.contentType = contentType;
        this.text = text;
        this.medias = medias;
    }

    public void addLike() {
        this.likeCounts++;
    }

    public void removeLike() {
        this.likeCounts--;
    }

    public void addComment() {
        this.commentCounts++;
    }

    public void removeComment() {
        this.commentCounts--;
    }
}
