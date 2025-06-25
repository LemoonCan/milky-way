package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.dto.FriendDTO;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendApplicationDO;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendDO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * @author lemoon
 * @since 2025/5/14
 */
@Mapper(componentModel = "spring", uses = {UserConverter.class, DateTimeConverter.class})
public abstract class FriendConverter {
    @Autowired
    protected SecureId secureId;

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeFriendApplicationId")
    public abstract FriendApplicationDTO toDTO(FriendApplicationDO friendApplicationDO);

    public abstract FriendDTO toDTO(FriendDO friendDO);

    @Named("encodeFriendApplicationId")
    protected String encodeFriendApplicationId(Long id) {
        return secureId.simpleEncode(id, secureId.getFriendApplicationSalt());
    }
}
