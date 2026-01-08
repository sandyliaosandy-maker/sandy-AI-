# Contentlayer 依赖冲突解决方案

## 问题描述

安装 Contentlayer 时遇到依赖冲突：
- 项目使用 Next.js 14.2.0
- `next-contentlayer@0.3.4` 只支持 Next.js 12 或 13
- 版本不兼容

## 解决方案

### 方案 1: 使用 --legacy-peer-deps 安装（推荐先尝试）

这个方案会忽略 peer dependency 冲突，强制安装：

```bash
cd "/Users/luyu/CascadeProjects/Sandy的AI收藏夹/01-源代码/网站代码"
npm install contentlayer next-contentlayer remark-gfm rehype-pretty-code rehype-slug rehype-autolink-headings --legacy-peer-deps
```

**优点**:
- 快速解决，可能可以正常工作
- Contentlayer 在 Next.js 14 上可能也能运行（虽然官方不支持）

**缺点**:
- 可能有兼容性问题
- 不是官方支持的配置

### 方案 2: 降级 Next.js 到 13.x（不推荐）

如果方案 1 不行，可以降级 Next.js：

```bash
npm install next@13.5.6 react@^18.2.0 react-dom@^18.2.0 --legacy-peer-deps
```

**缺点**:
- 失去 Next.js 14 的新特性
- 需要修改代码以适配 Next.js 13

### 方案 3: 使用替代方案（推荐长期方案）

如果 Contentlayer 在 Next.js 14 上确实有问题，可以使用替代方案：

#### 选项 A: next-mdx-remote

```bash
npm install next-mdx-remote remark remark-gfm rehype rehype-pretty-code
```

#### 选项 B: 直接使用 remark/rehype

```bash
npm install remark remark-gfm rehype rehype-pretty-code rehype-slug rehype-autolink-headings
```

## 推荐步骤

1. **先尝试方案 1**（使用 --legacy-peer-deps）
2. 如果安装成功，测试功能是否正常
3. 如果功能正常，继续使用
4. 如果功能异常，考虑方案 3

## 测试安装

安装后，运行以下命令测试：

```bash
# 类型检查
npm run type-check

# 构建测试
npm run build

# 启动开发服务器
npm run dev
```

## 如果方案 1 失败

如果使用 --legacy-peer-deps 后仍然有问题，请告诉我具体的错误信息，我会帮您切换到替代方案。



