package lemoon.can.milkyway.infrastructure.inner;

import lemoon.can.milkyway.common.enums.FilePermissionEnum;
import lemoon.can.milkyway.common.utils.FfmpegUtil;
import lemoon.can.milkyway.common.utils.Snowflake;
import lemoon.can.milkyway.domain.file.FileMetaInfo;
import lemoon.can.milkyway.infrastructure.repository.FileMetaInfoRepository;
import lemoon.can.milkyway.infrastructure.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;

/**
 * @author lemoon
 * @since 2025/7/15
 */
@Service
@RequiredArgsConstructor
public class VideoService {
    private final FileRepository fileRepository;
    private final FileMetaInfoRepository fileMetaInfoRepository;
    private final Snowflake fileSnowFlake;

    @Transactional
    public void generateCoverImage(FileMetaInfo videoFileMetaInfo) {
        FilePermissionEnum permission = videoFileMetaInfo.getPermission();
        String fileName = videoFileMetaInfo.getId() + "_cover";
        String filePath = fileRepository.filePath(permission, "system", fileName, ".jpg");
        FfmpegUtil.generateCoverImage(videoFileMetaInfo.getStoragePath(), filePath);

        String fileId = fileSnowFlake.nextId();
        FileMetaInfo fileMetaInfo = FileMetaInfo.builder()
                .id(fileId)
                .name(fileName)
                .type("image/jpeg")
                .size(new File(filePath).length())
                .storagePath(filePath)
                .permission(permission)
                .build();
        fileMetaInfoRepository.save(fileMetaInfo);

        videoFileMetaInfo.setVideoCoverImage(fileId);
        fileMetaInfoRepository.save(videoFileMetaInfo);
    }
}
