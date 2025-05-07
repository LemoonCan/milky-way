package lemoon.can.milkyway.facade.service;

import lemoon.can.milkyway.facade.param.FileParam;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author lemoon
 * @since 2025/5/1
 */
public interface FileService {
    String upload(FileParam param, MultipartFile multipartFile);
}
