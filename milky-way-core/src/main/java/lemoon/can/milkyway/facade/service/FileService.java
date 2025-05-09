package lemoon.can.milkyway.facade.service;

import lemoon.can.milkyway.facade.dto.AccessToken;
import lemoon.can.milkyway.facade.dto.FileDTO;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author lemoon
 * @since 2025/5/1
 */
public interface FileService {
    String upload(MultipartFile multipartFile);

    FileDTO loadFileAsResource(String accessToken);

    String generateTemporaryUrl(String fileId, Long expireInSeconds);

    AccessToken validateAccessToken(String token);

}
