# 🌌 Milky-Way Chat 仿微信桌面版聊天界面

这是一个使用现代前端技术栈构建的仿微信桌面版聊天界面项目。

## ✨ 技术栈

- **React 18** - 现代React框架
- **Vite** - 快速构建工具
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用优先的CSS框架
- **shadcn/ui** - 现代化组件库
- **Zustand** - 轻量级状态管理
- **Lucide React** - 美观的图标库

## 🎯 功能特性

### 三栏式布局
- **左侧导航栏**: 消息、好友、朋友圈、设置
- **中间消息列表**: 搜索功能、聊天用户列表
- **右侧聊天窗口**: 实时消息展示、输入工具栏

### 聊天功能
- 消息气泡显示（左右区分发送方）
- 实时消息发送
- 时间戳显示
- 用户在线状态
- 未读消息提醒

### 现代化设计
- 扁平化设计风格
- 响应式布局
- 深色模式支持
- 流畅的动画效果

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── ui/             # shadcn/ui基础组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── avatar.tsx
│   ├── SidebarNav.tsx  # 左侧导航栏
│   ├── ChatList.tsx    # 消息列表
│   ├── ChatListItem.tsx # 聊天列表项
│   ├── ChatWindow.tsx  # 聊天窗口
│   └── MessageBubble.tsx # 消息气泡
├── store/              # 状态管理
│   └── chat.ts         # 聊天状态Store
├── lib/                # 工具函数
│   └── utils.ts        # shadcn/ui工具函数
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 🎨 设计亮点

- **微信风格**: 仿照微信桌面版的界面设计
- **现代化**: 使用Tailwind CSS实现扁平化设计
- **响应式**: 支持不同屏幕尺寸
- **组件化**: 高度模块化的组件架构
- **类型安全**: 完整的TypeScript类型定义

## 📝 待开发功能

- [ ] 表情包支持
- [ ] 文件传输
- [ ] 语音消息
- [ ] 视频通话
- [ ] 群聊功能
- [ ] 好友管理
- [ ] 朋友圈功能
- [ ] 设置页面

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

Built with ❤️ using React + TypeScript + Tailwind CSS
