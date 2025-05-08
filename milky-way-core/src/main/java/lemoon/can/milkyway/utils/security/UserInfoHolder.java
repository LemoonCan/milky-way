package lemoon.can.milkyway.utils.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;

/**
 * @author lemoon
 * @since 2025/5/8
 */
public class UserInfoHolder {
    public static String userId(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication instanceof UsernamePasswordAuthenticationToken token){
            return ((User)token.getPrincipal()).getUsername();
        }
        return null;
    }
}
