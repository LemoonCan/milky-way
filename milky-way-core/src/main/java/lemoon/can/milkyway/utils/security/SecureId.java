package lemoon.can.milkyway.utils.security;

import org.hashids.Hashids;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Component
public class SecureId {
    private final static String FIXED_SALT = "sun-moon";

    private String generateRandomSalt() {
        byte[] salt = new byte[8];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    public String encode(Long id) {
        String randomSalt = generateRandomSalt();
        Hashids hashids = new Hashids(FIXED_SALT + randomSalt, 12);
        return hashids.encode(id) + "." + randomSalt;
    }

    public Long decode(String encoded) {
        String[] parts = encoded.split("\\.");
        if (parts.length != 2) {
            throw new IllegalArgumentException("非法ID");
        }

        Hashids decoder = new Hashids(FIXED_SALT + parts[1], 12);
        long[] decoded = decoder.decode(parts[0]);
        if (decoded.length == 0) {
            throw new IllegalArgumentException("非法ID");
        }
        return decoded[0];
    }

    public static void main(String[] args) {
        SecureId secureId = new SecureId();
        String encoded = secureId.encode(123456789L);
        System.out.println("Encoded: " + encoded);

        Long decoded = secureId.decode(encoded);
        System.out.println("Decoded: " + decoded);
    }
}