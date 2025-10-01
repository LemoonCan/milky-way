package lemoon.can.milkyway.facade.service.command;

import lemoon.can.milkyway.facade.dto.FileDTO;
import lemoon.can.milkyway.facade.dto.FileInfoDTO;
import lemoon.can.milkyway.facade.param.FileParam;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author lemoon
 * @since 2025/5/1
 */
public interface FileService {
    /**
     * 上传文件
     *
     * @param multipartFile 文件
     * @param fileParam     文件参数
     * @return 文件信息
     */
    FileInfoDTO upload(MultipartFile multipartFile, FileParam fileParam);

    /**
     * 删除文件
     *
     * @param fileId 文件ID
     */
    void delete(String fileId);

    /**
     * 访问文件
     *
     * @param fileId 文件ID
     * @return 文件
     */
    FileDTO loadFile(String fileId);

    /**
     * 临时访问文件
     *
     * @param accessCode 访问码
     * @return 文件
     */
    FileDTO temporaryLoadFile(String accessCode);

    /**
     * 生成访问链接
     *
     * @param fileId 文件ID
     * @return 访问链接
     */
    String generateAccessUrl(String fileId);

    /**
     * 生成临时访问链接
     *
     * @param fileId          文件ID
     * @param expireInSeconds 间隔过期时间（秒）
     * @return 临时访问链接
     */
    String generateTemporaryAccessUrl(String fileId, Long expireInSeconds);

    /**
     * 生成临时访问链接
     *
     * @param fileId        文件ID
     * @param expireAtSec 过期时间（毫秒）
     * @return 临时访问链接
     */
    String generateTemporaryAtAccessUrl(String fileId, Long expireAtSec);

    /**
     * 获取文件名称
     *
     * @param temporaryAccessUrl 临时访问链接
     * @return 文件名称
     */
    String getFileName(String temporaryAccessUrl);

    /**
     * 获取视频封面图访问链接
     *
     * @param temporaryAccessUrl 文件ID
     * @return 视频封面图访问链接
     */
    String getVideoCoverImageAccessUrl(String temporaryAccessUrl);

    /**
     *  是否过期
     * @param temporaryAccessUrl 临时访问链接
     * @return
     */
    boolean expire(String temporaryAccessUrl);

    /**
     * 从临时访问链接中获取文件ID
     *
     * @param temporaryAccessUrl 临时访问链接
     * @return 文件ID
     */
    String getFileId(String temporaryAccessUrl);
}
