package lemoon.can.milkyway.domain.file;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lemoon.can.milkyway.common.enums.FilePermissionEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * @author lemoon
 * @since 2025/5/1
 */
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileMetaInfo {
    /**
     * 文件ID
     */
    @Id
    private String id;
    /**
     * 文件名称
     */
    private String name;
    /**
     * 文件类型
     */
    private String type;
    /**
     * 文件存储路径
     */
    private String storagePath;
    /**
     * 文件大小
     */
    private Long size;
    /**
     * 文件权限
     */
    @Enumerated(EnumType.STRING)
    private FilePermissionEnum permission;

    /**
     * 扩展信息
     */
    private String extra;

    public void setVideoCoverImage(String coverImage) {
        if (isVideo()) {
            this.extra = coverImage;
        }
    }
    public String getVideoCoverImage() {
        if (isVideo()) {
            return extra;
        }
        return null;
    }

    public boolean isVideo() {
        return this.type.startsWith("video/");
    }
}
