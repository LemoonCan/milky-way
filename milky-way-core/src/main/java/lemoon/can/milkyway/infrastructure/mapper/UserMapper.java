package lemoon.can.milkyway.infrastructure.mapper;

import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.UserDTO;

/**
 * @author lemoon
 * @since 2025/5/13
 */
public class UserMapper {
    public static UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        UserDTO dto = new UserDTO();
        dto.setOpenId(user.getOpenId());
        dto.setNickName(user.getNickName());
        dto.setAvatar(user.getAvatar());
        return dto;
    }
}
