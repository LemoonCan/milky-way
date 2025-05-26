package lemoon.can.milkyway.common.utils.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;

/**
 * @author lemoon
 * @since 2025/4/30
 */
public class HttpHeaderToken {
    private final static String TOKEN_PREFIX = "Bearer ";
    private final static String SPECIAL_TOKEN = "authToken";

    public static String key() {
        return HttpHeaders.AUTHORIZATION;
    }

    public static String token(HttpServletRequest request) {
        String token = unwrapToken(request.getHeader(key()));
        //设个特殊参数，方便前端在不支持Authorization头的情况下传递token
        if (token == null) {
            token = unwrapToken(request.getParameter(SPECIAL_TOKEN));
        }
        return token;
    }

    public static String wrapToken(String token) {
        return TOKEN_PREFIX + token;
    }

    public static String unwrapToken(String token) {
        if (token == null) {
            return null;
        }
        if (token.startsWith(TOKEN_PREFIX)) {
            return token.substring(TOKEN_PREFIX.length());
        }
        return token;
    }
}
