package lemoon.can.milkyway.facade.param;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/5/7
 */
@Data
public class FileParam implements Serializable {
    /**
     * 文件类型
     */
    @NotBlank(message = "文件类型不能为空")
    private String type;
    /**
     * 文件名称
     */
    @NotBlank(message = "文件名称不能为空")
    private String name;
}
