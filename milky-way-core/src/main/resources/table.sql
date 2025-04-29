-- 创建用户主表
CREATE TABLE users
(
    id                   BIGINT PRIMARY KEY COMMENT '主键ID',
    open_id              VARCHAR(255) UNIQUE NOT NULL COMMENT '用户唯一标识',
    phone                VARCHAR(20) UNIQUE  NOT NULL COMMENT '手机号',
    password             VARCHAR(255)        NOT NULL COMMENT '密码',
    nick_name            VARCHAR(100) COMMENT '昵称',
    avatar               VARCHAR(255) COMMENT '头像',
    individual_signature VARCHAR(255) COMMENT '个性签名',
    register_time        TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    update_time          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    -- 登录信息嵌入字段
    last_login_time      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后登录时间',
    last_login_ip        VARCHAR(50) COMMENT '最后登录IP',
    last_login_device    VARCHAR(50) COMMENT '最后登录设备',
    -- 实名信息嵌入字段
    name                 VARCHAR(64) COMMENT '真实姓名',
    gender               VARCHAR(8) COMMENT '性别',
    id_card_number       VARCHAR(64) COMMENT '身份证号',
    id_card_front        VARCHAR(20) COMMENT '身份证正面',
    id_card_back         VARCHAR(20) COMMENT '身份证反面'
);

-- 索引
CREATE INDEX idx_users_open_id ON users (open_id);
CREATE INDEX idx_users_phone ON users (phone);

-- 创建朋友关系表
CREATE TABLE user_friends
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