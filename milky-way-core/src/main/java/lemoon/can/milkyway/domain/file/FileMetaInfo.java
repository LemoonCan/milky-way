package lemoon.can.milkyway.domain.file;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
    @Id
    private String id;
    private String name;
    private String type;
    private String storagePath;
    private Long size;
}
