package lemoon.can.milkyway.infrastructure.repository;

import org.apache.tika.Tika;
import org.apache.tika.mime.MimeType;
import org.apache.tika.mime.MimeTypeException;
import org.apache.tika.mime.MimeTypes;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
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
        //映射扩展名
        MimeType type;
        try {
            type = MimeTypes.getDefaultMimeTypes().forName(fileType);
        } catch (MimeTypeException e) {
            throw new RuntimeException(e);
        }
        String path = filePath(userOpenId, fileId, type.getExtension());
        Path filePath = Paths.get(path);
        try (
                BufferedInputStream bis = new BufferedInputStream(inputStream);
                BufferedOutputStream bos = new BufferedOutputStream(Files.newOutputStream(filePath))
        ) {
            byte[] buffer = new byte[8192];
            int length;
            long totalWritten = 0;

            while ((length = bis.read(buffer)) != -1) {
                bos.write(buffer, 0, length);
                totalWritten += length;
            }
            bos.flush();

            // 验证写入是否成功
            if (Files.size(filePath) == 0) {
                throw new IOException("文件写入失败：文件大小为0");
            }

            if (Files.size(filePath) != totalWritten) {
                throw new IOException("文件写入不完整：预期大小 " + totalWritten + "，实际大小 " + Files.size(filePath));
            }

            return path;
        }
    }

    private String filePath(String userOpenId, String fileId, String extension) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        String dir = "house/files/" + userOpenId + "/" + now.format(formatter) + "/";
        File directory = new File(dir);
        directory.mkdirs();
        return dir + fileId + extension;
    }

    public static void main(String[] args) {
        System.out.println(System.getProperty("user.dir"));
    }
}
