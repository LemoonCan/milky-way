package lemoon.can.milkyway.infrastructure.repository.dos;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/6/5
 */
@Data
public class MomentDO {
    private Long id;
    private String userId;
    private String userNickName;
    private String userAvatar;
    private Integer contentType;
    private String text;
    private List<String> medias;
    private String location;
    private Integer likeCounts;
    private Integer commentCounts;
    private LocalDateTime createTime;
}
