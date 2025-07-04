package lemoon.can.milkyway.common.utils;

import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import org.springframework.http.MediaType;

/**
 * @author lemoon
 * @since 2025/5/11
 */
public class FileUtil {
    public static MediaType parseMediaType(String fileType){
        MediaType mediaType;
        try {
            mediaType = MediaType.valueOf(fileType);
            return mediaType;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.UNSUPPORTED,
                    String.format("不支持的文件类型%s", fileType));
        }
    }
}
