package lemoon.can.milkyway.infrastructure.inner.chat;

import lemoon.can.milkyway.domain.chat.MessageProcessor;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author lemoon
 * @since 2025/5/16
 */
public class FileMessageProcessor implements MessageProcessor<MultipartFile> {
    @Override
    public void store(MultipartFile message) {

    }

    @Override
    public void push(MultipartFile message) {

    }
}
