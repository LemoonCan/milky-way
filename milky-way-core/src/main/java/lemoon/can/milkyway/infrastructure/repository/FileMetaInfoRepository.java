package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.domain.file.FileMetaInfo;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author lemoon
 * @since 2025/5/1
 */
public interface FileMetaInfoRepository extends JpaRepository<FileMetaInfo, String> {
}
