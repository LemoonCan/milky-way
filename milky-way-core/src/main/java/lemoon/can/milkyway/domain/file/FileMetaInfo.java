package lemoon.can.milkyway.domain.file;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lemoon.can.milkyway.common.FilePermissionEnum;
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
}
