# SVG Viewer Next

一个功能强大的在线 SVG/HTML 编辑器和查看器，为设计师和开发者提供完整的 SVG 图像编辑和预览解决方案。

## ✨ 特性

- 🎨 **实时编辑预览** - 支持 SVG 和 HTML 代码的实时编辑和预览
- 🖥️ **智能代码编辑器** - 基于 Monaco Editor，提供语法高亮和自动格式化
- 📱 **响应式设计** - 适配各种屏幕尺寸，提供优秀的用户体验
- 🌙 **主题切换** - 支持亮色和暗色主题
- 📁 **多种导入方式** - 支持文件导入、剪贴板导入和拖拽导入
- 💾 **强大的导出功能** - 支持代码复制、Data URI 生成、文件下载和图片导出
- 🔧 **可调整面板** - 灵活的面板布局，可根据需要调整编辑器和预览区大小
- 🎯 **智能预览** - 支持缩放、拖拽和多种背景模式

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

## 🔧 主要功能

### 代码编辑
- 支持 SVG 和 HTML 语法高亮
- 自动代码格式化
- 智能代码补全
- 支持语言切换（SVG/HTML）

### 实时预览
- 智能 SVG 渲染引擎
- 支持缩放和拖拽操作
- 多种背景模式：网格、白色、黑色、透明
- 响应式预览区域

### 导入功能
- **文件导入** - 直接选择本地文件导入
- **剪贴板导入** - 快速粘贴代码内容
- **拖拽导入** - 拖拽文件到编辑器区域

### 导出功能
- **复制到剪贴板** - 一键复制代码
- **生成 Data URI** - 快速生成数据 URI 格式
- **文件下载** - 保存为 .svg 或 .html 文件
- **导出图片** - 支持 1x、2x、3x 分辨率的 PNG 图片导出

## 🏗️ 项目结构

```
svg-viewer-next/
├── app/
│   ├── components/           # React 组件
│   │   ├── CodeEditor.js    # 代码编辑器组件
│   │   ├── PreviewPanel.js  # 预览面板组件
│   │   ├── HeaderBar.js     # 顶部标题栏
│   │   ├── EditorToolBar.js # 编辑器工具栏
│   │   └── ThemeToggle.js   # 主题切换组件
│   ├── utils/               # 工具函数
│   │   ├── fileUtils.js     # 文件处理工具
│   │   ├── svgUtils.js      # SVG 处理工具
│   │   └── storageUtils.js  # 本地存储工具
│   └── page.js              # 应用主页面
├── public/                  # 静态资源
└── package.json            # 项目配置
```

## 🛠️ 技术栈

- **前端框架**: [Next.js](https://nextjs.org/) - React 全栈框架
- **代码编辑器**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) - VS Code 同款编辑器
- **UI 组件**: [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) - 可调整大小的面板
- **图标库**: [Lucide React](https://lucide.dev/) - 美观的 SVG 图标库
- **样式**: CSS Modules + Tailwind CSS

## 💡 使用技巧

1. **快速导入**: 直接将 SVG 文件拖拽到编辑器区域即可导入
2. **代码格式化**: 使用工具栏的格式化按钮整理代码结构
3. **主题切换**: 根据使用环境选择合适的主题模式
4. **预览控制**: 使用鼠标滚轮缩放，拖拽移动预览内容
5. **导出选择**: 根据需要选择合适的导出格式和分辨率

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

## 📄 许可证

本项目基于 MIT 许可证开源。

---

**Built with ❤️ using Next.js**
