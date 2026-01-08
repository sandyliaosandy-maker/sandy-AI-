# Sandy的AI收藏夹 - 网站代码

基于 Next.js + React + TypeScript + Tailwind CSS 的个人知识库网站。

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **UI库**: React 18+
- **样式**: Tailwind CSS
- **图标**: Lucide React

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

访问 [http://localhost:3002](http://localhost:3002)

### 构建

```bash
npm run build
npm start
```

## 项目结构

```
.
├── app/              # Next.js App Router
├── components/       # React 组件
├── lib/              # 工具函数
└── public/           # 静态资源
```

## 开发规范

参考 `02-文档资料/开发文档/代码规范/` 目录下的规范文档。

## 脚本命令

- `npm run dev` - 开发模式
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 代码检查
- `npm run type-check` - TypeScript 类型检查
- `npm run format` - 代码格式化
- `npm run check` - 完整检查（类型+lint+格式）

