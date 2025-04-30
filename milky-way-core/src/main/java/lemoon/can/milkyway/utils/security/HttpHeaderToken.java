package lemoon.can.milkyway.utils.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;

/**
 * @author lemoon
 * @since 2025/4/30
 */
public class HttpHeaderToken {
    private final static String TOKEN_PREFIX = "Bearer ";
    public static String key(){
        return HttpHeaders.AUTHORIZATION;
    }

    public static String token(HttpServletRequest request){
        return unwrapToken(request.getHeader(key()));
    }

    public static String wrapToken(String token){
        return TOKEN_PREFIX + token;
    }

    public static String unwrapToken(String token){
        if(token == null){
            return null;
        }
        if(token.startsWith(TOKEN_PREFIX)){
            return token.substring(TOKEN_PREFIX.length());
        }
        return token;
    }
}
