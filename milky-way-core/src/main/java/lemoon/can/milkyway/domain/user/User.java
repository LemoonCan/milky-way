package lemoon.can.milkyway.domain.user;

import jakarta.persistence.*;
import lemoon.can.milkyway.domain.friend.Friend;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

/**
 * @author lemoon
 * @since 2025/4/21
 */
@Entity(name = "users")
@Getter
@NoArgsConstructor
public class User {
    /**
     * 主键
     * 使用自增主键
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
     * 实名信息
     */
    @Embedded
    private RealNameInfo realNameInfo;

    /**
     * 登录信息
     */
    @Embedded
    private LoginInfo loginInfo;

    /**
     * 朋友列表
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Friend> friends;

    public User(String openId, String phone, String password) {
        this.openId = StringUtils.hasLength(openId) ? openId : generateOpenId();
        this.phone = phone;
        this.password = password;
    }

    private String generateOpenId() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String dateTime = LocalDateTime.now().format(formatter);
        return "milky_" + dateTime + new Random().nextInt(10, 100);
    }

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
     * @param friend 朋友
     */
    public void addFriend(Friend friend) {
        this.friends.add(friend);
    }

}
