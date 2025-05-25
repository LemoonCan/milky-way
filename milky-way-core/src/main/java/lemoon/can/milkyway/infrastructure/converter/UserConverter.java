package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.domain.user.User;
import lemoon.can.milkyway.facade.dto.UserDTO;
import lemoon.can.milkyway.infrastructure.repository.dos.UserDO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * @author lemoon
 * @since 2025/5/13
 */
@Mapper(componentModel = "spring")
public abstract class UserConverter {
    @Autowired
    protected SecureId secureId;

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeUserId")
    public abstract UserDTO toDTO(User user);

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeUserId")
    public abstract UserDTO toDTO(UserDO userDO);

    @Named( "encodeUserId")
    protected String encodeUserId(Long id) {
        return secureId.encode(id, secureId.getUserSalt());
    }
}
