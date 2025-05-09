package lemoon.can.milkyway.utils.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lemoon.can.milkyway.facade.dto.AccessToken;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * @author lemoon
 * @since 2025/5/9
 */
@Component
public class AccessTokenManager {
    public String generateSignature(String data, String key){
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secretKeySpec);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String fullSignature = Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
            // 只返回前16个字符
            return fullSignature.substring(0, 16);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("生成HMAC签名失败", e);
        }
    }

    public String encode(AccessToken token) {
        try {
            // 将token对象转换为JSON字符串
            String jsonToken = new ObjectMapper().writeValueAsString(token);
            // Base64 URL安全编码
            return Base64.getUrlEncoder().withoutPadding().encodeToString(
                    jsonToken.getBytes(StandardCharsets.UTF_8)
            );
        } catch (JsonProcessingException e) {
            throw new RuntimeException("令牌编码失败", e);
        }
    }

    public AccessToken decode(String encodedToken) {
        try {
            // Base64 URL 解码
            byte[] jsonBytes = Base64.getUrlDecoder().decode(encodedToken);
            String jsonString = new String(jsonBytes, StandardCharsets.UTF_8);

            // JSON 字符串转换为 AccessToken 对象
            return new ObjectMapper().readValue(jsonString, AccessToken.class);
        } catch (Exception e) {
            throw new RuntimeException("令牌解码失败", e);
        }
    }
}