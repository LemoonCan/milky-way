package lemoon.can.milkyway.facade.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * @author lemoon
 * @since 2025/5/1
 */
public interface FileService {
    String upload(MultipartFile multipartFile);
}
