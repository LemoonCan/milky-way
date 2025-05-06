package lemoon.can.milkyway.infrastructure.repository;

import org.springframework.stereotype.Repository;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * @author lemoon
 * @since 2025/5/6
 */
@Repository
public class FileRepositoryImpl implements FileRepository {

    @Override
    public String storage(InputStream inputStream, String userOpenId, String fileId, String fileType) throws IOException {
        //目录 用户/每天/具体文件
        String path = filePath(userOpenId, fileId, fileType);
        try (
                BufferedInputStream bis = new BufferedInputStream(inputStream);
                BufferedOutputStream bos = new BufferedOutputStream(Files.newOutputStream(Paths.get(path)))
        ) {
            byte[] buffer = new byte[8192];
            int length;
            while ((length = bis.read(buffer)) != -1) {
                bos.write(buffer, 0, length);
            }
            return path;
        }
    }

    private String filePath(String userOpenId, String fileId, String fileType) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        return userOpenId + "/" + now.format(formatter) + "/" + fileId + "." + fileType;
    }
}
