package lemoon.can.milkyway.infrastructure.converter.helper;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

/**
 * @author lemoon
 * @since 2025/6/27
 */
@Component
@RequiredArgsConstructor
public class SecureIdConverterHelper {
    private final SecureId secureId;

    @Named("encodeChatId")
    public String encodeChatId(Long id) {
        return secureId.simpleEncode(id, secureId.getChatSalt());
    }
    @Named("decodeChatId")
    public Long decodeChatId(String encodedId) {
        return secureId.simpleDecode(encodedId, secureId.getChatSalt());
    }

    @Named("encodeFriendApplicationId")
    public String encodeFriendApplicationId(Long id) {
        return secureId.simpleEncode(id, secureId.getFriendApplicationSalt());
    }
    @Named("decodeFriendApplicationId")
    public Long decodeFriendApplicationId(String encodedId) {
        return secureId.simpleDecode(encodedId, secureId.getFriendApplicationSalt());
    }

    @Named("encodeMessageId")
    public String encodeMessageId(Long id) {
        return secureId.simpleEncode(id, secureId.getMessageSalt());
    }
    @Named("decodeMessageId")
    public Long decodeMessageId(String encodedId) {
        return secureId.simpleDecode(encodedId, secureId.getMessageSalt());
    }
}
