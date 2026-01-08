# 修复 shiki 版本兼容性问题

## 问题描述

`rehype-pretty-code` 需要旧版本的 `shiki`，但新版本的 `shiki` API 已经改变，导致不兼容。

## 解决方案

我已经暂时禁用了 `rehype-pretty-code`，这样可以先让 Contentlayer 正常工作。代码高亮功能可以在后续添加。

### 已做的修改

1. ✅ 在 `contentlayer.config.ts` 中注释掉了 `rehype-pretty-code`
2. ✅ 修复了 `ctaLink` 未使用的警告

### 现在请重新运行构建

```bash
npm run build
```

**预期结果**:
- 构建成功
- 生成 `.contentlayer/generated` 目录
- 生成 TypeScript 类型文件

### 验证

构建成功后，运行：

```bash
# 类型检查
npm run type-check

# 启动开发服务器
npm run dev
```

## 后续优化（可选）

如果需要代码高亮功能，可以：

### 方案 1: 安装兼容的 shiki 版本

```bash
npm install shiki@0.14.7 --legacy-peer-deps
```

然后取消注释 `rehype-pretty-code`。

### 方案 2: 使用其他代码高亮方案

- `rehype-highlight` + `highlight.js`
- `rehype-prism-plus` + `prismjs`

## 当前状态

- ✅ Contentlayer 配置已修复
- ✅ 代码错误已修复
- ⏳ 需要重新运行构建



