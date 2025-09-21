package lemoon.can.milkyway.common.utils.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lemoon.can.milkyway.common.exception.CustomSecurityException;
import lemoon.can.milkyway.common.exception.SecurityErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class JwtTokenProvider {
    @Value("${jwt.token-validity}")
    private long TOKEN_VALIDITY;
    private final SecretKey key;

    public JwtTokenProvider(@Value("${jwt.secret-key}") String secretKey) {
        // 对称加密算法
        key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * 创建带有不同过期时间的令牌
     *
     * @param authentication 认证信息
     * @return JWT令牌
     */
    public String createToken(Authentication authentication) {
        long now = System.currentTimeMillis();
        long tokenValidity = TOKEN_VALIDITY;
        Date validity = new Date(now + tokenValidity);

        return Jwts.builder()
                .setSubject(authentication.getName())
                .signWith(key)
                .setIssuedAt(new Date(now))
                .setExpiration(validity)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        validateToken(token);
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Collection<? extends GrantedAuthority> authorities = List.of();
        UserDetails principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    public void validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
        }catch (ExpiredJwtException e){

            throw new CustomSecurityException(SecurityErrorCode.TOKEN_EXPIRED);
        } catch (Exception e) {
            throw new CustomSecurityException(SecurityErrorCode.TOKEN_INVALID);
        }
    }
} 