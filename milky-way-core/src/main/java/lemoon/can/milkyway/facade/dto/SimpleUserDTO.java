package lemoon.can.milkyway.facade.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * @author lemoon
 * @since 2025/6/7
 */
@Data
public class SimpleUserDTO implements Serializable {
    /**
     * 用户Id
     */
    private String id;
    /**
     * 昵称
     */
    private String nickName;
    /**
     * 头像
     */
    private String avatar;

}
