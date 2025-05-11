package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotNull;
import lemoon.can.milkyway.common.FilePermissionEnum;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/5/11
 */
@Data
public class FileParam implements Serializable {
    @NotNull(message = "文件权限不能为空")
    private FilePermissionEnum permission;
}
