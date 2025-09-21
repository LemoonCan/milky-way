package lemoon.can.milkyway.config.http;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lemoon.can.milkyway.common.exception.CustomSecurityException;
import lemoon.can.milkyway.common.exception.SecurityErrorCode;
import lemoon.can.milkyway.common.utils.security.HttpHeaderToken;
import lemoon.can.milkyway.common.utils.security.JwtTokenProvider;
import lemoon.can.milkyway.controller.Result;
import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
@Component
public class JwtAuthorizationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = HttpHeaderToken.token(request);
            if (!StringUtils.hasLength(token)) {
                filterChain.doFilter(request, response);
                return;
            }
            Authentication authentication = tokenProvider.getAuthentication(token);
            if (authentication != null) {
                String userId = authentication.getName();
                // 验证是否异地登录
                String lastLoginToken = userRepository.findLastLoginTokenBy(userId);
                if (!token.equals(lastLoginToken)) {
                    throw new CustomSecurityException(SecurityErrorCode.ANOTHER_LOGIN);
                }
            }
            SecurityContextHolder.getContext().setAuthentication(authentication);
            filterChain.doFilter(request, response);
        } catch (CustomSecurityException e) {
            handleJwtException(response, e);
        }
    }

    private void handleJwtException(HttpServletResponse response, CustomSecurityException e) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json;charset=UTF-8");

        Result<Void> result = Result.fail(e.getErrorCode(), e.getMessage());
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }
} 