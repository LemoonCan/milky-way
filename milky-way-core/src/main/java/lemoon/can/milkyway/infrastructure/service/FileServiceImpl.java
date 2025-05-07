package lemoon.can.milkyway.infrastructure.service;

import lemoon.can.milkyway.config.Env;
import lemoon.can.milkyway.domain.file.FileMetaInfo;
import lemoon.can.milkyway.facade.param.FileParam;
import lemoon.can.milkyway.infrastructure.repository.FileMetaInfoRepository;
import lemoon.can.milkyway.infrastructure.repository.FileRepository;
import lemoon.can.milkyway.facade.service.FileService;
import lemoon.can.milkyway.utils.Snowflake;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * @author lemoon
 * @since 2025/5/1
 */
@RequiredArgsConstructor
@Service
public class FileServiceImpl implements FileService {
    private final Snowflake fileSnowFlake;
    private final FileRepository fileRepository;
    private final FileMetaInfoRepository fileMetaInfoRepository;
    private final Env env;

    @Override
    public String upload(FileParam fileParam, MultipartFile multipartFile) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getDetails();

        String path;
        String id = fileSnowFlake.nextId();
        String fileType = fileParam.getType();
        try {
            path = fileRepository.storage(multipartFile.getInputStream(), userDetails.getUsername(), id, fileType);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        FileMetaInfo fileMetaInfo = FileMetaInfo.builder()
                .id(id)
                .name(fileParam.getName())
                .type(fileType)
                .size(multipartFile.getSize())
                .storagePath(path)
                .build();
        fileMetaInfoRepository.save(fileMetaInfo);

        return env.getDomain() + env.getFileviewUrl();
    }
}
