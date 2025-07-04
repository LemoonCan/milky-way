## 技术选型
后端：SpringBoot+MySQL+Redis+WebSocket(STOMP)
前端：React 18 + Vite + TypeScript + Tailwind CSS

## 功能
- 用户
  - 注册
  - 登录(在线/离线)
    - SpringSecurity+JWT 无状态认证
    - HTTPS+前端不加密
  - 搜索
- 朋友管理
  - 添加朋友
    - 搜索
    - 申请
    - 同意
  - 删除
  - 拉黑
  - 朋友列表
    - 本地搜索
- 聊天
  - 操作
    - 创建
    - 删除
    - 信息变更
    - 成员加入
    - 成员退出
  - 按参与人数分类
    - 单聊
    - 群聊
  - 按内容分类
    - 文字
    - 语音
    - 视频
    - 文件
- 分享
  - 发布
  - 点赞
  - 评论
- 文件
  - 上传
  - 访问
  - 删除
  - 权限控制