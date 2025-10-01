package lemoon.can.milkyway.infrastructure.job;

import lemoon.can.milkyway.common.constant.FileConstant;
import lemoon.can.milkyway.common.enums.ExtInfoKeyName;
import lemoon.can.milkyway.domain.ExtInfo;
import lemoon.can.milkyway.facade.service.command.FileService;
import lemoon.can.milkyway.infrastructure.repository.ExtInfoRepository;
import lemoon.can.milkyway.infrastructure.repository.dos.MessageDO;
import lemoon.can.milkyway.infrastructure.repository.mapper.MessageMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * @author lemoon
 * @since 2025/10/1
 */
@RequiredArgsConstructor
@Component
@Slf4j
public class OverdueMediaClearJob {
    private final ExtInfoRepository extInfoRepository;
    private final MessageMapper messageMapper;
    private final FileService fileService;

    @Scheduled(cron = "0 0 4 * * *", zone = "Asia/Shanghai")
    @Transactional(rollbackFor = Exception.class)
    public void execute() {
        log.info("执行多媒体文件清理任务");
        //1.查询待清理的多媒体消息
        Optional<ExtInfo> optional = extInfoRepository.findByKeyName(ExtInfoKeyName.msg_media_clear_cursor);
        Long cursor = null;
        if (optional.isPresent()) {
            cursor = Long.parseLong(optional.get().getKeyValue());
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime beforeTime = now.minusDays(FileConstant.PRIVATE_FILE_VALID_DAYS);
        List<MessageDO> messages = messageMapper.getMediaMessagesBefore(cursor, beforeTime);

        if (messages.isEmpty()) {
            log.info("无多媒体文件可清理");
            return;
        }

        //2.清理多媒体文件
        List<String> errorMessages = new ArrayList<>();
        String lastClearMessageId = null;
        for (MessageDO messageDO : messages) {
            String fileId = null;
            try {
                fileId = fileService.getFileId(messageDO.getContent());
                fileService.delete(fileId);
                lastClearMessageId = messageDO.getId().toString();
            } catch (Exception e) {
                errorMessages.add(fileId + "-" + e.getMessage());
            }
        }

        if(!errorMessages.isEmpty()){
            log.error("清理失败的文件: {}", String.join(", ", errorMessages));
        }

        //3.记录清理进度
        if (lastClearMessageId != null) {
            ExtInfo extInfo;
            if (optional.isPresent()) {
                extInfo = optional.get();
                extInfo.setKeyValue(lastClearMessageId);
            } else {
                extInfo = new ExtInfo(ExtInfoKeyName.msg_media_clear_cursor, lastClearMessageId);
            }
            extInfoRepository.save(extInfo);
        }
    }
}
