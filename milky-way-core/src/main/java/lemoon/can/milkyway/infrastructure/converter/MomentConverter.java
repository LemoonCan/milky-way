package lemoon.can.milkyway.infrastructure.converter;

import lemoon.can.milkyway.domain.share.Moment;
import lemoon.can.milkyway.facade.dto.MomentDTO;
import lemoon.can.milkyway.facade.dto.MomentDescriptionDTO;
import lemoon.can.milkyway.infrastructure.converter.helper.DateTimeConverterHelper;
import lemoon.can.milkyway.infrastructure.converter.helper.SecureIdConverterHelper;
import lemoon.can.milkyway.infrastructure.repository.dos.MomentDO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

/**
 * @author lemoon
 * @since 2025/7/5
 */
@Mapper(componentModel = "spring",
        uses = {DateTimeConverterHelper.class, SecureIdConverterHelper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MomentConverter {
    @Mapping(target = "id", source = "id", qualifiedByName = "encodeMomentId")
    MomentDTO toMomentDTO(MomentDO momentDO);

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeMomentId")
    MomentDTO toMomentDTO(Moment moment);

    @Mapping(target = "id", source = "id", qualifiedByName = "encodeMomentId")
    MomentDescriptionDTO toMomentDescriptionDTO(MomentDO momentDO);
}
