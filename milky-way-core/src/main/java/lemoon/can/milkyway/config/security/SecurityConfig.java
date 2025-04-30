package lemoon.can.milkyway.config.security;

import lemoon.can.milkyway.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.frameoptions.XFrameOptionsHeaderWriter;
import org.springframework.stereotype.Service;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Optional;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final SecurityProperties securityProperties;
    private final JwtAuthorizationFilter jwtAuthorizationFilter;
    private final UserRepository userRepository;

    /**
     * Spring Security 过滤器链
     * @param http HttpSecurity
     * @return SecurityFilterChain
     * @throws Exception 异常
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .headers(headers -> headers
                        .addHeaderWriter(new XFrameOptionsHeaderWriter(XFrameOptionsHeaderWriter.XFrameOptionsMode.SAMEORIGIN)))
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 跨域
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 无状态 API
                .requiresChannel(channel ->
                        channel.anyRequest().requiresSecure()) // HTTPS
                .csrf(AbstractHttpConfigurer::disable) // CSRF 保护关闭？
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(securityProperties.getPermitUrls().toArray(new String[0])).permitAll() // 放行接口
                        .anyRequest().authenticated()) // 其他接口需认证
                .addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class); // JWT认证过滤器(先于路径匹配执行)


        return http.build();
    }

    /**
     * 跨域配置
     * @return CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(securityProperties.getCors().getAllowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowCredentials(true);
        config.setAllowedHeaders(List.of("Content-Type", "Authorization"));
        config.setExposedHeaders(List.of("Authorization"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * 身份验证管理器
     * @param authenticationConfiguration 身份验证配置
     * @return AuthenticationManager
     * @throws Exception 异常
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * 密码编码器
     * @return PasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        //随机盐值会在加密后的数据中存储
        return new BCryptPasswordEncoder(12);
    }

    @Service
    public class UserDetailsServiceImpl implements UserDetailsService {
        @Override
        public UserDetails loadUserByUsername(String openId) throws UsernameNotFoundException {
            Optional<lemoon.can.milkyway.domain.user.User> userOptional = userRepository.findByOpenId(openId);
            lemoon.can.milkyway.domain.user.User user = userOptional.orElseThrow(() -> new UsernameNotFoundException("用户不存在"));
            return new User(user.getOpenId(), user.getPassword(), List.of());
        }
    }
} 