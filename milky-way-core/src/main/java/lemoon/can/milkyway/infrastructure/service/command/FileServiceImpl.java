package lemoon.can.milkyway.infrastructure.service.command;

import lemoon.can.milkyway.config.Env;
import lemoon.can.milkyway.domain.file.FileMetaInfo;
import lemoon.can.milkyway.facade.dto.AccessToken;
import lemoon.can.milkyway.facade.dto.FileDTO;
import lemoon.can.milkyway.facade.dto.FileInfoDTO;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lemoon.can.milkyway.facade.param.FileParam;
import lemoon.can.milkyway.facade.service.command.FileService;
import lemoon.can.milkyway.infrastructure.repository.FileMetaInfoRepository;
import lemoon.can.milkyway.infrastructure.repository.FileRepository;
import lemoon.can.milkyway.common.utils.Snowflake;
import lemoon.can.milkyway.common.utils.security.AccessTokenManager;
import lemoon.can.milkyway.common.utils.security.UserInfoHolder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.io.TikaInputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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
    @Transactional
    public FileInfoDTO upload(MultipartFile multipartFile, FileParam fileParam) {
        String fileId = fileSnowFlake.nextId();
        String path;
        String fileType;
        //使用TikaInputStream，可在检测文件类型后，重置流位置
        try (TikaInputStream tis = TikaInputStream.get(multipartFile.getInputStream())) {
            fileType = new Tika().detect(tis);
            path = fileRepository.storage(tis, fileParam, UserInfoHolder.userId(), fileId, fileType);
        } catch (IOException e) {
            //最佳实践：有其他信息需要打印时，将异常放在最后，保证能打印出堆栈信息
            log.error("文件{}上传失败", multipartFile.getOriginalFilename(), e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件上传失败");
        }
        FileMetaInfo fileMetaInfo = FileMetaInfo.builder()
                .id(fileId)
                .name(multipartFile.getOriginalFilename())
                .type(fileType)
                .size(multipartFile.getSize())
                .storagePath(path)
                .permission(fileParam.getPermission())
                .build();
        fileMetaInfoRepository.save(fileMetaInfo);

        return uploadResult(fileId, fileParam);
    }

    private FileInfoDTO uploadResult(String fileId, FileParam fileParam) {
        switch (fileParam.getPermission()) {
            case PUBLIC -> {
                String url = generateAccessUrl(fileId);
                FileInfoDTO fileInfoDTO = new FileInfoDTO();
                fileInfoDTO.setFileId(fileId);
                fileInfoDTO.setFileAccessUrl(url);
                return fileInfoDTO;
            }
            case PRIVATE -> {
                String url = generateTemporaryAccessUrl(fileId, 60 * 10L);
                FileInfoDTO fileInfoDTO = new FileInfoDTO();
                fileInfoDTO.setFileId(fileId);
                fileInfoDTO.setFileAccessUrl(url);
                return fileInfoDTO;
            }
            default -> throw new BusinessException(ErrorCode.UNSUPPORTED, "不支持的文件权限");
        }
    }

    @Override
    public FileDTO loadFile(String fileId) {
        //1.从文件元信息表中查询文件路径
        FileMetaInfo fileMetaInfo = fileMetaInfoRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "文件元数据不存在"));

        //2.从本地存储系统加载文件并构建Resource
        Resource resource = new FileSystemResource(fileMetaInfo.getStoragePath());
        if (resource.exists()) {
            return new FileDTO(fileMetaInfo.getName(), fileMetaInfo.getType(), resource);
        } else {
            throw new BusinessException(ErrorCode.NOT_FOUND, "文件不存在");
        }
    }

    @Override
    public FileDTO temporaryLoadFile(String accessCode) {
        AccessToken accessToken = accessTokenManager.parseAndValidate(accessCode, secretKey);
        return loadFile(accessToken.getObjectId());
    }

    @Override
    public String generateAccessUrl(String fileId) {
        return env.getDomain() + env.getFileAccessUrl() + "/" + fileId;
    }

    @Override
    public String generateTemporaryAccessUrl(String fileId, Long expireInSeconds) {
        long expireAtSec = (System.currentTimeMillis() + expireInSeconds * 1000) / 1000;
        String accessCode = accessTokenManager.build(fileId, expireAtSec, secretKey);
        return env.getDomain() + env.getFileAccessUrl() + "?accessCode=" + accessCode;
    }

}