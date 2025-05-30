package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.UserDTO;
import lemoon.can.milkyway.infrastructure.repository.dos.UserDO;
import org.mapstruct.Mapper;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Mapper(componentModel = "spring")
public abstract class UserConverter {
    public abstract UserDTO toDTO(User user);

    public abstract UserDTO toDTO(UserDO userDO);
}
