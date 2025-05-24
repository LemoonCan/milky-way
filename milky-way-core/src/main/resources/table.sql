-- 用户表
CREATE TABLE users
(
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    open_id              VARCHAR(255) UNIQUE NOT NULL COMMENT '用户唯一标识',
    phone                VARCHAR(20) UNIQUE  NOT NULL COMMENT '手机号',
    password             VARCHAR(255)        NOT NULL COMMENT '密码',
    nick_name            VARCHAR(100) COMMENT '昵称',
    avatar               VARCHAR(255) COMMENT '头像',
    individual_signature VARCHAR(255) COMMENT '个性签名',
    register_time        TIMESTAMP  DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    update_time          TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    -- 登录信息嵌入字段
    online               TINYINT(1) DEFAULT 0 COMMENT '是否在线',
    last_login_time      TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后登录时间',
    last_login_ip        VARCHAR(50) COMMENT '最后登录IP',
    last_login_device    VARCHAR(50) COMMENT '最后登录设备',
    -- 实名信息嵌入字段
    name                 VARCHAR(64) COMMENT '真实姓名',
    gender               VARCHAR(8) COMMENT '性别',
    id_card              VARCHAR(64) COMMENT '身份证号',
    id_card_front        VARCHAR(20) COMMENT '身份证正面',
    id_card_back         VARCHAR(20) COMMENT '身份证反面'
);

-- 索引
CREATE INDEX idx_users_open_id ON users (open_id);
CREATE INDEX idx_users_phone ON users (phone);

-- 朋友关系表
CREATE TABLE friend
(
    user_id     BIGINT      NOT NULL COMMENT '用户ID',
    friend_id   BIGINT      NOT NULL COMMENT '朋友ID',
    status      VARCHAR(16) NOT NULL COMMENT '状态',
    remark      VARCHAR(100) COMMENT '备注',
    permission  VARCHAR(64) COMMENT '权限',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE friend_application
(
    id           BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    from_user_id BIGINT       NOT NULL COMMENT '申请人唯一标识',
    to_user_id   BIGINT       NOT NULL COMMENT '接收人唯一标识',
    apply_msg    VARCHAR(255) NOT NULL COMMENT '申请消息',
    status       VARCHAR(16)  NOT NULL COMMENT '状态',
    permission   VARCHAR(64)  NOT NULL COMMENT '权限',
    create_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 文件元信息表
CREATE TABLE file_meta_info
(
    id           VARCHAR(255) PRIMARY KEY COMMENT '文件唯一标识',
    name         VARCHAR(255) NOT NULL COMMENT '文件名',
    type         VARCHAR(50) COMMENT '文件类型',
    storage_path VARCHAR(255) COMMENT '文件存储路径',
    size         BIGINT COMMENT '文件大小(字节)',
    permission   VARCHAR(16)  NOT NULL COMMENT '权限',
    create_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 聊天室表
CREATE TABLE chat
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '聊天室ID',
    type        VARCHAR(50)  NOT NULL COMMENT '聊天室类型',
    title       VARCHAR(255) NOT NULL COMMENT '聊天室标题',
    bulletin    TEXT COMMENT '聊天室公告',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 聊天室成员表
CREATE TABLE chat_member
(
    chat_id        BIGINT NOT NULL COMMENT '聊天室ID',
    user_id        BIGINT NOT NULL COMMENT '用户ID',
    chat_remark    VARCHAR(255) COMMENT '聊天室备注',
    chat_nick_name VARCHAR(255) COMMENT '聊天室昵称',
    mute           BOOLEAN   DEFAULT FALSE COMMENT '免打扰',
    top            BOOLEAN   DEFAULT FALSE COMMENT '是否置顶',
    create_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (chat_id, user_id)
);

drop table Chat;
drop table ChatMember;