package lemoon.can.milkyway.infrastructure.repository;

import java.io.IOException;
import java.io.InputStream;

/**
 * @author lemoon
 * @since 2025/5/1
 */
public interface FileRepository {
    String storage(InputStream inputStream, String userOpenId, String fileId, String fileType) throws IOException;
}
