package lemoon.can.milkyway.facade.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @author lemoon
 * @since 2025/7/9
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class UserDetailDTO extends UserDTO{
    private MomentDescriptionDTO lastMoment;
}
