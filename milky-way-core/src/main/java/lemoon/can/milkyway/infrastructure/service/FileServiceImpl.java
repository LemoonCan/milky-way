package lemoon.can.milkyway.infrastructure.service;

import lemoon.can.milkyway.config.Env;
import lemoon.can.milkyway.domain.file.FileMetaInfo;
import lemoon.can.milkyway.facade.dto.AccessToken;
import lemoon.can.milkyway.facade.dto.FileDTO;
import lemoon.can.milkyway.facade.service.FileService;
import lemoon.can.milkyway.infrastructure.repository.FileMetaInfoRepository;
import lemoon.can.milkyway.infrastructure.repository.FileRepository;
import lemoon.can.milkyway.utils.Snowflake;
import lemoon.can.milkyway.utils.security.AccessTokenManager;
import lemoon.can.milkyway.utils.security.UserInfoHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.io.TikaInputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

/**
 * @author lemoon
 * @since 2025/5/1
 */
@RequiredArgsConstructor
@Service
@Slf4j
public class FileServiceImpl implements FileService {
    private final Snowflake fileSnowFlake;
    private final FileRepository fileRepository;
    private final FileMetaInfoRepository fileMetaInfoRepository;
    private final Env env;
    private final AccessTokenManager accessTokenManager;
    @Value("${file.access.secret-key}")
    private String secretKey;

    @Override
    public String upload(MultipartFile multipartFile) {
        String fileId = fileSnowFlake.nextId();
        String path;
        String fileType;
        //使用TikaInputStream，可在检测文件类型后，重置流位置
        try (TikaInputStream tis = TikaInputStream.get(multipartFile.getInputStream())) {
            fileType = new Tika().detect(tis);
            path = fileRepository.storage(tis, UserInfoHolder.userId(), fileId, fileType);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        FileMetaInfo fileMetaInfo = FileMetaInfo.builder()
                .id(fileId)
                .name(multipartFile.getOriginalFilename())
                .type(fileType)
                .size(multipartFile.getSize())
                .storagePath(path)
                .build();
        fileMetaInfoRepository.save(fileMetaInfo);

        return generateTemporaryUrl(fileId, 60 * 10L);
    }

    @Override
    public FileDTO loadFileAsResource(String token) {
        AccessToken accessToken = validateAccessToken(token);
        // 1. 从文件元信息表中查询文件路径
        FileMetaInfo fileMetaInfo = fileMetaInfoRepository.findById(accessToken.getObjectId())
                .orElseThrow(() -> new RuntimeException("文件不存在"));

        // 2. 从本地存储系统加载文件并构建Resource
        try {
            Resource resource = new FileSystemResource(fileMetaInfo.getStoragePath());
            if (resource.exists()) {
                return new FileDTO(fileMetaInfo.getId(), fileMetaInfo.getType(), resource);
            } else {
                throw new RuntimeException("文件不存在");
            }
        } catch (Exception e) {
            throw new RuntimeException("无法加载文件", e);
        }
    }

    @Override
    public String generateTemporaryUrl(String fileId, Long expireInSeconds) {
        // 1. 创建访问令牌
        AccessToken accessToken = new AccessToken();
        accessToken.setObjectId(fileId);
        accessToken.setExpireAt(System.currentTimeMillis() + expireInSeconds * 1000);

        // 2. 生成签名
        String dataToSign = fileId + ":" + accessToken.getExpireAt();
        String signature = accessTokenManager.generateSignature(dataToSign, secretKey);
        accessToken.setSignature(signature);

        // 3. 将令牌转换为URL安全的字符串
        String token = accessTokenManager.encode(accessToken);

        // 4. 构建完整的URL
        return env.getDomain() + env.getFileAccessUrl() + token;


    }

    @Override
    public AccessToken validateAccessToken(String token) {
        // 1. 解码令牌
        AccessToken accessToken = accessTokenManager.decode(token);

        // 2. 验证签名
        String dataToSign = accessToken.getObjectId() + ":" + accessToken.getExpireAt();
        String expectedSignature = accessTokenManager.generateSignature(dataToSign, secretKey);
        if (!expectedSignature.equals(accessToken.getSignature())) {
            throw new IllegalArgumentException("非法令牌");
        }

        // 3. 检查是否过期
        if (System.currentTimeMillis() > accessToken.getExpireAt()) {
            throw new IllegalArgumentException("令牌已过期");
        }
        return accessToken;
    }

}