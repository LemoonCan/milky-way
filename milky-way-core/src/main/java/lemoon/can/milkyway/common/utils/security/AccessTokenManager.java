package lemoon.can.milkyway.common.utils.security;

import lemoon.can.milkyway.facade.dto.AccessToken;
import lemoon.can.milkyway.common.exception.BusinessException;
import lemoon.can.milkyway.common.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Base64;

/**
 * 令牌管理器
 * token = Base64UrlWithoutPadding( fileId + "." + expire + "." + sig8 )
 * 生成约 40 字符的 URL-Safe 字符串
 *
 * @author lemoon
 * @since 2025/5/9
 */
@Component
@Slf4j
public class AccessTokenManager {
    /**
     * 生成签名（截取 6 字节 → 8 字符）
     *
     * @param data 待签名数据
     * @param key  密钥
     * @return 签名
     */
    private String shortSignature(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            byte[] first6 = Arrays.copyOf(hash, 6); // 48 bit
            return Base64.getUrlEncoder().withoutPadding().encodeToString(first6); // 8 字符
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("生成 HMAC 签名失败, data: {}, key: {}", data, key, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR);
        }
    }

    /**
     * 生成 token
     *
     * @param objectId    对象ID
     * @param expireAtSec 过期时间（秒）
     * @param secretKey   密钥
     * @return accessCode 令牌
     */
    public String build(String objectId, long expireAtSec, String secretKey) {
        String sig8 = shortSignature(objectId + ":" + expireAtSec, secretKey);
        String raw = objectId + "." + expireAtSec + "." + sig8;
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 解析 + 校验 accessCode
     *
     * @param accessCode 令牌
     * @param secretKey  密钥
     * @return AccessToken 对象
     */
    public AccessToken parseAndValidate(String accessCode, String secretKey) {
        // 1. Base64 解码
        String raw = new String(Base64.getUrlDecoder().decode(accessCode), StandardCharsets.UTF_8);
        String[] parts = raw.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("非法 token");
        }

        String objectId = parts[0];
        long expireAtSec = Long.parseLong(parts[1]);
        String sig8 = parts[2];

        // 2. 过期检查
        if (System.currentTimeMillis() / 1000 > expireAtSec) {
            throw new IllegalArgumentException("令牌已过期");
        }

        // 3. 签名校验
        String expectedSig = shortSignature(objectId + ":" + expireAtSec, secretKey);
        if (!expectedSig.equals(sig8)) {
            throw new IllegalArgumentException("签名不匹配");
        }

        // 4. 构造 AccessToken 对象
        AccessToken at = new AccessToken();
        at.setObjectId(objectId);
        at.setExpireAt(expireAtSec * 1000);
        at.setSignature(sig8);
        return at;
    }
}