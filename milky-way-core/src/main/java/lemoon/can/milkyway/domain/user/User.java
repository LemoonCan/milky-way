package lemoon.can.milkyway.domain.user;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @author lemoon
 * @since 2025/4/21
 */
public class User {
    /**
     * 主键
     */
    private Long id;

    /**
     * 开放Id
     */
    private String openId;
    /**
     * 手机号
     */
    private String phone;
    /**
     * 密码
     */
    private String password;

    /**
     * 实名信息
     */
    private RealNameInfo realNameInfo;

    /**
     * 昵称
     */
    private String nickName;
    /**
     * 头像
     */
    private String avatar;
    /**
     * 个性签名
     */
    private String individualSignature;


    /**
     * 注册时间
     */
    private LocalDateTime registerTime;

    /**
     * 登录信息
     */
    private LoginInfo loginInfo;

    /**
     * 朋友列表
     */
    private List<User> friends;

    /**
     * 修改密码
     *
     * @param password 新密码
     */
    public void changePassword(String password) {
        //校验 新密码与老密码不一致/格式检查
        this.password = password;
    }

    /**
     * 变更账号
     *
     * @param openId 新账号
     */
    public void changeOpenId(String openId) {
        //校验 唯一性检查/格式检查
        this.openId = openId;
    }

    /**
     * 变更个人信息
     *
     * @param nickName            昵称
     * @param avatar              头像
     * @param individualSignature 个性签名
     */
    public void changeInfo(String nickName, String avatar, String individualSignature) {
        this.nickName = nickName;
        this.avatar = avatar;
        this.individualSignature = individualSignature;
    }

    /**
     * 实名认证
     *
     * @param realNameInfo 实名信息
     */
    public void realNameAuth(RealNameInfo realNameInfo) {
        //校验 实名信息是否符合要求
        this.realNameInfo = realNameInfo;
    }

    /**
     * 添加朋友
     *
     * @param user 朋友
     */
    public void addFriend(User user) {
        this.friends.add(user);
    }

}
