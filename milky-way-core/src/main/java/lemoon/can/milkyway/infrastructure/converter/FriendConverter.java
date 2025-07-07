package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.facade.dto.FriendApplicationDTO;
import lemoon.can.milkyway.facade.dto.FriendDTO;
import lemoon.can.milkyway.infrastructure.converter.helper.DateTimeConverterHelper;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendApplicationDO;
import lemoon.can.milkyway.infrastructure.repository.dos.FriendDO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * @author lemoon
 * @since 2025/5/14
 */
@Mapper(componentModel = "spring", uses = {UserConverter.class, DateTimeConverterHelper.class, SecureIdConverterHelper.class})
public abstract class FriendConverter {

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeFriendApplicationId")
    public abstract FriendApplicationDTO toDTO(FriendApplicationDO friendApplicationDO);

    public abstract FriendDTO toDTO(FriendDO friendDO);}
