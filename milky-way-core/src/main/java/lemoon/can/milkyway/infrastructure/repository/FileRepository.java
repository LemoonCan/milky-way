package lemoon.can.milkyway.infrastructure.repository;

import lemoon.can.milkyway.common.enums.FilePermissionEnum;
import lemoon.can.milkyway.facade.param.FileParam;

import java.io.IOException;
import java.io.InputStream;

/**
 * @author lemoon
 * @since 2025/5/1
 */
public interface FileRepository {
    /**
     * 存储文件
     *
     * @param inputStream 文件输入流
     * @param fileParam   文件参数
     * @param userId  用户ID
     * @param fileId      文件ID
     * @param fileType    文件类型
     * @return 存储路径
     * @throws IOException IO异常
     */
    String storage(InputStream inputStream, FileParam fileParam, String userId, String fileId, String fileType) throws IOException;

    /**
     * 清除文件
     *
     * @param filePath 文件路径
     * @return 是否成功
     */
    boolean clear(String filePath);

    /**
     * 获取文件存储路径
     *
     * @param permission 文件权限
     * @param userId 用户ID
     * @param fileId     文件ID
     * @param extension  文件扩展名
     * @return 文件存储路径
     */
    String filePath(FilePermissionEnum permission, String userId, String fileId, String extension);
}
