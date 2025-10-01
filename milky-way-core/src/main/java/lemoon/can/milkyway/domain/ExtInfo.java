package lemoon.can.milkyway.domain;

import jakarta.persistence.*;
import lemoon.can.milkyway.common.enums.ExtInfoKeyName;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author lemoon
 * @since 2025/10/1
 */
@Entity(name = "ext_info")
@Getter
@NoArgsConstructor
public class ExtInfo {
    /**
     * 主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 键名
     */
    @Enumerated(EnumType.STRING)
    private ExtInfoKeyName keyName;

    /**
     * 键值
     */
    @Setter
    private String keyValue;

    public ExtInfo(ExtInfoKeyName keyName, String keyValue) {
        this.keyName = keyName;
        this.keyValue = keyValue;
    }
}
