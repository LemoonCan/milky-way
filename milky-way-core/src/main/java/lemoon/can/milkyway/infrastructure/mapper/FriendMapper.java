package lemoon.can.milkyway.infrastructure.mapper;

import lemoon.can.milkyway.common.utils.security.SecureId;
import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.dto.FriendDTO;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendApplicationDO;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendDO;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * @author lemoon
 * @since 2025/5/14
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public abstract class FriendMapper {
    @Autowired
    protected SecureId secureId;

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeId")
    public abstract FriendApplicationDTO toDTO(FriendApplicationDO friendApplicationDO);

    public abstract FriendDTO toDTO(FriendDO friendDO);

    @Named("encodeId")
    protected String encodeId(Long id) {
        return secureId.encode(id);
    }
}
