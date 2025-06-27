package lemoon.can.milkyway.common.utils.security;

import lombok.Getter;
import org.hashids.Hashids;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Component
public class SecureId {
    @Value("${security.secure-id.friend-application-salt}")
    @Getter
    private String friendApplicationSalt;

    @Value("${security.secure-id.chat-salt}")
    @Getter
    private String chatSalt;

    @Value("${security.secure-id.message-salt}")
    @Getter
    private String messageSalt;

    @Value("${security.secure-id.moment-salt}")
    @Getter
    private String momentSalt;

    @Value("${security.secure-id.comment-salt}")
    @Getter
    private String commentSalt;


    private String generateRandomSalt() {
        byte[] salt = new byte[8];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    public String encode(Long id, String fixedSalt) {
        String randomSalt = generateRandomSalt();
        Hashids hashids = new Hashids(fixedSalt + randomSalt, 12);
        return hashids.encode(id) + "." + randomSalt;
    }

    public Long decode(String encoded, String fixedSalt) {
        String[] parts = encoded.split("\\.");
        if (parts.length != 2) {
            throw new IllegalArgumentException("非法ID");
        }

        Hashids decoder = new Hashids(fixedSalt + parts[1], 12);
        long[] decoded = decoder.decode(parts[0]);
        if (decoded.length == 0) {
            throw new IllegalArgumentException("非法ID");
        }
        return decoded[0];
    }

    public String simpleEncode(Long id, String fixedSalt) {
        Hashids hashids = new Hashids(fixedSalt, 12);
        return hashids.encode(id);
    }

    public Long simpleDecode(String encoded, String fixedSalt) {
        Hashids decoder = new Hashids(fixedSalt, 12);
        long[] decoded = decoder.decode(encoded);
        if (decoded.length == 0) {
            throw new IllegalArgumentException("非法ID");
        }
        return decoded[0];
    }
}