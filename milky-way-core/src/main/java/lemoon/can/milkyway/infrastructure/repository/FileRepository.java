package lemoon.can.milkyway.infrastructure.repository;

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
     * @param userOpenId  用户ID
     * @param fileId      文件ID
     * @param fileType    文件类型
     * @return 存储路径
     * @throws IOException IO异常
     */
    String storage(InputStream inputStream, FileParam fileParam, String userOpenId, String fileId, String fileType) throws IOException;
}
