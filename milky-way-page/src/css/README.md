# CSS 样式组织说明

## 目录结构

```
src/css/
├── index.css                   # 全局样式和CSS变量定义
├── App.module.css             # App组件样式
├── ChatWindow.module.css      # 聊天窗口组件样式
├── ChatList.module.css        # 聊天列表组件样式
├── ChatListItem.module.css    # 聊天列表项组件样式
├── MessageBubble.module.css   # 消息气泡组件样式
├── SidebarNav.module.css      # 侧边导航组件样式
└── README.md                  # 此说明文档
```

## 重构内容

### 1. 全局样式 (index.css)
- 保持原有的全局样式和CSS变量
- 包含milky主题颜色定义
- 通用组件样式（如.milky-container, .milky-sidebar等）

### 2. 组件样式模块化
所有组件的内联样式已被提取为CSS Module文件：

#### App.module.css
- 主内容区域布局
- 空状态页面样式
- 页面级别的布局样式

#### ChatWindow.module.css
- 聊天窗口完整样式
- 消息容器、输入框、工具栏等
- 响应式设计支持

#### ChatList.module.css
- 聊天列表头部和搜索框样式
- 列表容器和空状态样式

#### ChatListItem.module.css
- 头像容器和状态指示器
- 在线状态和未读消息徽章样式

#### MessageBubble.module.css
- 消息气泡容器布局
- 消息内容和时间样式
- 发送者和接收者样式区分

#### SidebarNav.module.css
- 侧边导航样式
- 导航图标和用户头像样式

## 样式使用方式

### CSS Module 导入
```tsx
import styles from '../css/ComponentName.module.css'
```

### 类名使用
```tsx
<div className={styles.className}>
  {/* 内容 */}
</div>
```

### 组合类名
```tsx
<div className={`${styles.baseClass} ${condition ? styles.activeClass : ''}`}>
  {/* 内容 */}
</div>
```

## 优势

1. **样式隔离**: CSS Module确保样式不会互相冲突
2. **可维护性**: 样式与逻辑分离，便于维护和修改
3. **可读性**: 语义化的类名提高代码可读性
4. **性能优化**: 样式文件可以被缓存和优化
5. **团队协作**: 统一的样式组织方式便于团队开发

## 注意事项

1. Avatar组件保留了部分内联样式，因为涉及动态计算的样式值
2. 保持了原有的全局CSS类名（如.milky-container）以确保兼容性
3. 所有组件功能和视觉效果保持不变
4. 支持响应式设计，在小屏幕设备上会适当调整布局

## 构建验证

- ✅ TypeScript编译通过
- ✅ Vite构建成功
- ✅ 所有组件样式正常工作
- ✅ 响应式设计正常 