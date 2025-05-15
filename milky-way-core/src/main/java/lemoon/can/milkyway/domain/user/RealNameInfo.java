package lemoon.can.milkyway.domain.user;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lemoon.can.milkyway.common.enums.GenderEnum;

/**
 * @author lemoon
 * @since 2025/4/21
 */
@Embeddable
public class RealNameInfo {
    /**
     * 姓名
     */
    private String name;
    /**
     * 性别
     */
    @Enumerated(EnumType.STRING)
    private GenderEnum gender;
    /**
     * 身份证号
     */
    private String idCard;
    /**
     * 身份证正面照片
     */
    private String idCardFront;
    /**
     * 身份证反面照片
     */
    private String idCardBack;
}
