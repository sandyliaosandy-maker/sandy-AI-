---
name: Obsidian + Git + Next.js 网站开发方案
overview: 基于现有 Obsidian 知识库，使用 Git-based Headless CMS 模式，通过 Obsidian Git 插件自动同步到 GitHub，Next.js + Contentlayer 构建静态网站
todos:
  - id: obsidian-structure
    content: 在 Obsidian 知识库中创建 Inbox/Public/Private 目录结构，配置 .gitignore
    status: pending
  - id: obsidian-git
    content: 安装并配置 Obsidian Git 插件，测试 Git 同步功能
    status: pending
    dependencies:
      - obsidian-structure
  - id: github-repo
    content: 创建 GitHub 仓库，采用单一仓库方案（代码+内容共存），配置 .gitignore 排除 Private
    status: pending
    dependencies:
      - obsidian-git
  - id: init-nextjs
    content: 初始化 Next.js 项目，安装 Contentlayer 和相关依赖
    status: pending
  - id: contentlayer-config
    content: 配置 Contentlayer（contentlayer.config.ts），定义 News/Note/Page 文档类型
    status: pending
    dependencies:
      - init-nextjs
  - id: content-integration
    content: 配置内容目录集成（单一仓库方案），将 Obsidian Public 目录内容同步到项目 content/ 目录
    status: pending
    dependencies:
      - contentlayer-config
      - github-repo
  - id: attachments-sync
    content: 配置图片附件同步（Obsidian Public/attachments → public/attachments），添加构建脚本
    status: pending
    dependencies:
      - content-integration
  - id: layout-components
    content: 开发基础布局组件（Header、Footer、导航）
    status: pending
    dependencies:
      - init-nextjs
  - id: home-page
    content: 开发 Home 页面，使用 Contentlayer 读取并展示 News 内容
    status: pending
    dependencies:
      - attachments-sync
      - layout-components
  - id: notes-page
    content: 开发 Notes 页面和详情页，展示 Note 内容
    status: pending
    dependencies:
      - attachments-sync
      - layout-components
  - id: about-page
    content: 开发 About 页面，读取并渲染 Pages/about.md
    status: pending
    dependencies:
      - attachments-sync
      - layout-components
  - id: ui-components
    content: 开发 UI 基础组件（Button、Card、Icon），配置设计系统
    status: pending
    dependencies:
      - layout-components
  - id: styling
    content: 配置 Tailwind CSS 主题（配色、圆角、字体），实现参考网站的设计风格
    status: pending
    dependencies:
      - ui-components
      - home-page
      - notes-page
      - about-page
  - id: seo-optimization
    content: 添加 SEO metadata、Open Graph 标签，优化页面性能
    status: pending
    dependencies:
      - styling
  - id: vercel-deploy
    content: 配置 Vercel 部署，设置 GitHub Webhook 自动构建
    status: pending
    dependencies:
      - seo-optimization
---

# Obsidi

an + Git + Next.js 网站开发方案

## 架构概览

```javascript
Python 萃取系统 → Obsidian /Inbox
个人写作/小红书 → Obsidian /Public/Notes  
Obsidian Git 插件 → GitHub 仓库
GitHub Webhook → Vercel 自动构建
Next.js + Contentlayer → 静态网站
```



## 本地项目文件夹组织方案（分类、分级、命名）

### 项目根目录结构

```
Sandy的AI收藏夹/                    # 项目根目录
│
├── 📁 01-源代码/                   # 一级分类：核心代码
│   ├── 网站代码/                    # 二级分类：Next.js 项目
│   │   ├── app/                    # Next.js App Router（框架要求英文）
│   │   ├── components/            # React 组件
│   │   ├── lib/                    # 工具函数库
│   │   ├── public/                 # 静态资源（框架要求英文）
│   │   └── ...                     # 其他 Next.js 文件
│   │
│   └── 内容源/                      # 二级分类：Obsidian 内容
│       ├── 收件箱/                  # 三级：草稿内容
│       ├── 公开内容/                # 三级：网站内容
│       │   ├── 新闻/
│       │   ├── 笔记/
│       │   ├── 页面/
│       │   └── 附件/
│       └── 私有笔记/                # 三级：私有内容（Git 忽略）
│
├── 📁 02-文档资料/                   # 一级分类：文档和资料
│   ├── 需求文档/                    # 二级分类：需求相关
│   │   ├── 功能需求.md
│   │   ├── UI设计需求.md
│   │   └── 技术方案.md
│   │
│   ├── 设计稿/                      # 二级分类：设计相关
│   │   ├── UI设计稿/
│   │   ├── 原型图/
│   │   └── 参考网站截图/
│   │
│   ├── 开发文档/                    # 二级分类：开发相关
│   │   ├── API文档.md
│   │   ├── 组件文档.md
│   │   └── 部署文档.md
│   │
│   └── 探讨草稿/                    # 二级分类：草稿和讨论
│       ├── AI方案1
│       └── obsidian_+_git_+_next.js_网站开发方案_5303a6af.plan.md
│
├── 📁 03-配置文件/                   # 一级分类：配置文件
│   ├── 环境配置/                    # 二级分类：环境相关
│   │   ├── .env.local
│   │   ├── .env.production
│   │   └── .env.development
│   │
│   ├── Git配置/                     # 二级分类：Git 相关
│   │   ├── .gitignore
│   │   └── .gitattributes
│   │
│   └── 编辑器配置/                  # 二级分类：编辑器相关
│       ├── .vscode/
│       └── .idea/
│
├── 📁 04-脚本工具/                   # 一级分类：工具脚本
│   ├── 构建脚本/                    # 二级分类：构建相关
│   │   ├── 同步附件.js
│   │   └── 构建前处理.js
│   │
│   ├── 数据同步/                    # 二级分类：数据同步
│   │   ├── 小红书同步.js
│   │   └── 知识萃取同步.js
│   │
│   └── 工具脚本/                    # 二级分类：其他工具
│       └── 批量处理.js
│
├── 📁 05-资源文件/                   # 一级分类：资源文件
│   ├── 图片素材/                    # 二级分类：图片
│   │   ├── 网站图标/
│   │   ├── 插画素材/
│   │   └── 背景图片/
│   │
│   ├── 字体文件/                    # 二级分类：字体
│   │   └── 自定义字体/
│   │
│   └── 其他资源/                    # 二级分类：其他
│       └── 音频视频/
│
├── 📁 06-测试文件/                   # 一级分类：测试相关
│   ├── 单元测试/                    # 二级分类：测试代码
│   ├── 测试数据/                    # 二级分类：测试数据
│   └── 测试报告/                    # 二级分类：测试报告
│
├── 📁 07-备份存档/                   # 一级分类：备份文件
│   ├── 代码备份/                    # 二级分类：代码备份
│   ├── 数据库备份/                  # 二级分类：数据备份
│   └── 历史版本/                    # 二级分类：历史版本
│
└── 📁 08-临时文件/                   # 一级分类：临时文件
    ├── 临时数据/                    # 二级分类：临时数据
    └── 缓存文件/                    # 二级分类：缓存
```

### 文件夹命名规范

#### 一级分类（功能分类）
- 使用数字前缀：`01-`、`02-`、`03-` 等，便于排序
- 使用中文描述：清晰表达文件夹用途
- 使用图标前缀（可选）：📁 便于视觉识别

#### 二级分类（子功能分类）
- 不使用数字前缀（避免过度嵌套）
- 使用中文描述
- 按功能逻辑分组

#### 三级分类（具体内容）
- 根据实际需要设置
- 保持简洁明了

### 分类原则

1. **按功能分类**：
   - 源代码、文档、配置、脚本、资源等

2. **按生命周期分类**：
   - 开发中、已完成、已归档、临时文件

3. **按重要性分类**：
   - 核心文件、辅助文件、备份文件

4. **按访问频率分类**：
   - 常用文件、偶尔使用、历史存档

### 命名规则

1. **使用中文命名**：清晰易懂
2. **使用数字前缀**：一级分类使用 `01-`、`02-` 等，便于排序
3. **避免特殊字符**：不使用 `/`、`\`、`:`、`*`、`?`、`"`、`<`、`>`、`|` 等
4. **保持一致性**：同类文件夹使用相同的命名风格
5. **长度适中**：文件夹名不要太长，建议 2-8 个汉字

### 文件组织建议

#### 核心工作区（最常用）
```
01-源代码/
├── 网站代码/          # 主要开发目录
└── 内容源/            # Obsidian 内容
```

#### 参考文档区
```
02-文档资料/
├── 需求文档/          # 查看需求
├── 设计稿/            # 查看设计
└── 探讨草稿/          # 查看方案
```

#### 工具配置区
```
03-配置文件/           # 环境配置
04-脚本工具/           # 工具脚本
```

#### 辅助资源区
```
05-资源文件/           # 图片、字体等
06-测试文件/           # 测试相关
```

#### 归档区
```
07-备份存档/           # 备份文件
08-临时文件/           # 临时文件（可定期清理）
```

### 实际使用示例

**日常开发工作流**：
1. 主要在 `01-源代码/网站代码/` 中工作
2. 内容编辑在 `01-源代码/内容源/` 中
3. 查看文档在 `02-文档资料/` 中
4. 运行脚本在 `04-脚本工具/` 中

**文件查找**：
- 按功能分类，快速定位到对应文件夹
- 数字前缀确保文件夹按顺序排列

**版本控制**：
- `.gitignore` 中忽略 `07-备份存档/` 和 `08-临时文件/`
- 只提交核心代码和必要文档

## 项目结构（代码目录结构）

### Obsidian 知识库目录结构

```
您的Obsidian知识库/
├── 收件箱/                    # Python 萃取系统的草稿
│   └── *.md
├── 公开内容/                   # 网站公开内容（Git 提交）
│   ├── 新闻/                  # 对应 Home 页面（知识萃取内容）
│   │   └── *.md
│   ├── 笔记/                  # 对应 Notes 页面（小红书/个人写作）
│   │   └── *.md
│   ├── 页面/                  # 对应 About 等单页
│   │   └── 关于.md
│   └── 附件/                  # 图片和附件（Obsidian 默认附件路径）
│       └── *.png, *.jpg, etc.
└── 私有笔记/                  # 私有笔记（Git 忽略）
    └── *.md
```

### Next.js 项目结构（全中文命名）

```
Sandy的AI收藏夹/
├── 应用/                      # Next.js App Router
│   ├── 布局.tsx              # 全局布局
│   ├── 页面.tsx              # Home 页面（首页）
│   ├── 笔记/
│   │   ├── 页面.tsx          # Notes 列表页
│   │   └── [别名]/
│   │       └── 页面.tsx      # Notes 详情页
│   ├── 关于/
│   │   └── 页面.tsx          # About 页面
│   └── 接口/
│       └── 重新验证/          # 可选：手动触发重新构建
│           └── 路由.ts
├── 内容/                      # 单一仓库：直接包含公开内容
│   └── 公开内容/              # 从 Obsidian 同步或软链接
│       ├── 新闻/
│       ├── 笔记/
│       ├── 页面/
│       └── 附件/              # 图片附件（构建时同步到 静态资源/）
├── 组件/                      # React 组件
│   ├── 界面组件/              # UI 基础组件
│   │   ├── 按钮.tsx          # 按钮组件（支持多种样式）
│   │   ├── 卡片.tsx          # 卡片组件
│   │   └── 图标.tsx          # 图标组件封装
│   ├── 布局组件/              # 布局相关组件
│   │   ├── 头部.tsx          # 导航头部
│   │   ├── 页脚.tsx          # 页脚
│   │   └── 导航栏.tsx        # 导航栏
│   ├── 内容组件/              # 内容展示组件
│   │   ├── 文章卡片.tsx      # 文章卡片
│   │   ├── 文章列表.tsx      # 文章列表
│   │   ├── 横幅区域.tsx      # Hero 横幅区域
│   │   └── 内容渲染.tsx      # Markdown 渲染组件
│   └── 装饰组件/              # 装饰性元素
│       ├── 浮动圆圈.tsx       # 装饰圆圈
│       └── 微芯片图案.tsx     # 微芯片装饰
├── 工具库/                    # 工具函数和配置
│   ├── 工具函数.ts            # 通用工具函数
│   ├── 日期处理.ts            # 日期格式化
│   └── 内容处理.ts            # 内容相关工具
├── 样式/                      # 样式相关文件
│   ├── 全局样式.css           # 全局样式
│   └── 主题配置.ts            # 主题配置（如果使用 CSS-in-JS）
├── 脚本/                      # 构建和工具脚本
│   ├── 同步附件.js            # 同步附件脚本
│   └── 构建前处理.js          # 构建前处理脚本
├── 静态资源/                  # 静态资源（public 目录）
│   ├── 附件/                  # 同步后的图片附件
│   ├── 图片/                  # 网站图片
│   └── 图标/                  # 网站图标
├── 配置文件/                  # 配置文件目录（可选）
│   ├── 内容层配置.ts          # Contentlayer 配置
│   └── 构建配置.js            # Next.js 构建配置
├── .gitignore                 # Git 忽略文件
├── package.json               # 依赖配置
├── tsconfig.json              # TypeScript 配置
├── tailwind.config.js         # Tailwind CSS 配置
├── next.config.js             # Next.js 配置
└── vercel.json                # Vercel 部署配置
```

### 关键文件说明（中文命名对应）

| 中文路径 | 实际文件路径 | 说明 |
|---------|------------|------|
| `应用/布局.tsx` | `app/layout.tsx` | Next.js 全局布局 |
| `应用/页面.tsx` | `app/page.tsx` | 首页 |
| `应用/笔记/页面.tsx` | `app/notes/page.tsx` | 笔记列表页 |
| `应用/关于/页面.tsx` | `app/about/page.tsx` | 关于页面 |
| `组件/界面组件/按钮.tsx` | `components/ui/Button.tsx` | 按钮组件 |
| `组件/界面组件/卡片.tsx` | `components/ui/Card.tsx` | 卡片组件 |
| `组件/内容组件/横幅区域.tsx` | `components/Hero.tsx` | Hero 组件 |
| `内容/公开内容/新闻/` | `content/Public/News/` | 新闻内容目录 |
| `内容/公开内容/笔记/` | `content/Public/Notes/` | 笔记内容目录 |
| `静态资源/附件/` | `public/attachments/` | 图片附件目录 |
| `配置文件/内容层配置.ts` | `contentlayer.config.ts` | Contentlayer 配置 |

### 目录命名规范

1. **Obsidian 知识库**：
   - `收件箱/` - 草稿内容
   - `公开内容/` - 网站公开内容
   - `私有笔记/` - 私有内容（Git 忽略）

2. **Next.js 项目**：
   - `应用/` - Next.js App Router 目录
   - `组件/` - React 组件（按功能分类）
   - `内容/` - Markdown 内容文件
   - `工具库/` - 工具函数
   - `样式/` - 样式文件
   - `脚本/` - 构建脚本
   - `静态资源/` - 静态资源文件
   - `配置文件/` - 配置文件（可选，也可放在根目录）

### 重要说明：框架限制与兼容性

⚠️ **Next.js 框架要求**：

Next.js 的 App Router 要求以下目录名必须使用英文（框架硬性要求）：
- `app/` - App Router 目录（必须）
- `public/` - 静态资源目录（必须）

**解决方案：混合命名策略**

1. **框架要求的目录**：保持英文（`app/`, `public/`）
2. **自定义目录**：使用中文命名
3. **路径别名配置**：在 `tsconfig.json` 中配置别名，方便引用

**实际项目结构（混合方案）**：

```
Sandy的AI收藏夹/
├── app/                      # Next.js 框架要求（必须英文）
│   ├── layout.tsx
│   ├── page.tsx
│   ├── 笔记/
│   │   └── page.tsx
│   └── 关于/
│       └── page.tsx
├── 组件/                      # 中文命名
├── 内容/                      # 中文命名
├── 工具库/                    # 中文命名
├── 脚本/                      # 中文命名
└── public/                    # Next.js 框架要求（必须英文）
    └── 附件/
```

**路径别名配置**（`tsconfig.json`）：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/组件/*": ["./组件/*"],
      "@/内容/*": ["./内容/*"],
      "@/工具库/*": ["./工具库/*"],
      "@/脚本/*": ["./脚本/*"]
    }
  }
}
```

**使用示例**：

```typescript
// 在代码中使用别名引用
import { Button } from '@/组件/界面组件/按钮'
import { 工具函数 } from '@/工具库/工具函数'
```

### 注意事项

⚠️ **中文命名潜在问题**：

1. **Git 兼容性**：某些 Git 客户端可能对中文路径支持不佳
2. **构建工具**：部分构建工具可能有编码问题
3. **团队协作**：不同操作系统（Windows/Mac/Linux）可能有路径编码差异
4. **Vercel 部署**：需要确认 Vercel 对中文路径的支持

**建议**：
- 优先使用混合方案（框架目录英文，自定义目录中文）
- 如果遇到问题，可以考虑使用拼音命名
- 使用路径别名（path alias）来简化引用

**备选方案（全拼音命名）**：
```
应用/ → yingyong/
组件/ → zujian/
内容/ → neirong/
工具库/ → gongjuku/
静态资源/ → jingtaiziyuan/
```



## 技术栈详细配置

### 1. Contentlayer 配置

**文件**: `contentlayer.config.ts`

```typescript
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export const News = defineDocumentType(() => ({
  name: 'News',
  filePathPattern: 'Public/News/**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    score: { type: 'number', required: false },
    summary: { type: 'string', required: false },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('Public/News/', ''),
    },
  },
}))

export const Note = defineDocumentType(() => ({
  name: 'Note',
  filePathPattern: 'Public/Notes/**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    source: { type: 'string', required: false }, // 小红书/个人写作
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('Public/Notes/', ''),
    },
  },
}))

export const Page = defineDocumentType(() => ({
  name: 'Page',
  filePathPattern: 'Public/Pages/**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('Public/Pages/', ''),
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [News, Note, Page],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      rehypePrettyCode,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
})
```



### 2. Markdown Frontmatter 格式规范

所有 Markdown 文件必须包含 YAML Frontmatter：**News 文章格式** (`/Public/News/*.md`):

```yaml
---
title: "DeepSeek 商业化分析"
date: 2023-10-27
tags: [AI, 商业]
score: 9.5
summary: "一句话摘要..."
---
```

**Notes 文章格式** (`/Public/Notes/*.md`):

```yaml
---
title: "我的小红书笔记标题"
date: 2024-01-15
tags: [生活, 分享]
source: "xiaohongshu"
---
```

**Pages 单页格式** (`/Public/Pages/about.md`):

```yaml
---
title: "关于我"
---
```



### 3. Obsidian Git 插件配置

**设置步骤**:

1. 在 Obsidian 中安装 "Obsidian Git" 插件
2. 配置 Git 仓库（如果知识库还不是 Git 仓库，需要初始化）
3. 设置自动备份间隔（建议 20-30 分钟）
4. 配置 `.gitignore` 确保 `/Private` 目录被忽略

**`.gitignore` 配置**:

```javascript
Private/
.obsidian/workspace.json
.obsidian/workspace-mobile.json
```



### 4. GitHub 仓库设置（推荐：单一仓库方案）

**采用方案：单一仓库 + 内容与代码共存**

- **仓库结构**：GitHub 仓库同时包含网站代码和 Obsidian 的 Public 内容
- **优点**：
  - Vercel 构建时能直接拉取到完整的 Public/ 文件夹
  - 配置最简单，出错率最低
  - 无需处理 Git Submodule 的权限问题
- **实现方式**：
  - 在 Obsidian 知识库中，将网站代码作为子目录或同级目录
  - 或者：将 Obsidian 的 Public 目录内容复制/软链接到网站项目的 content/ 目录
  - `.gitignore` 中只排除 `Private/` 目录，确保 Public 内容被提交

**本地开发工作流**：
- 方案A：Obsidian 知识库作为网站项目的父目录，网站代码在子目录中
- 方案B：使用软链接（Symlink）将 Obsidian 的 Public 目录链接到网站项目的 content/ 目录

## 实现步骤

### 阶段一：Obsidian 知识库适配

1. **创建目录结构**

- 在 Obsidian 知识库根目录创建 `Inbox/`、`Public/News/`、`Public/Notes/`、`Public/Pages/`、`Private/` 目录
- 如果已有内容，需要迁移到对应目录

2. **配置 Git**

- 初始化 Git 仓库（如果还没有）
- 配置 `.gitignore` 忽略 Private 目录
- 创建 GitHub 仓库并关联

3. **安装配置 Obsidian Git 插件**

- 安装插件
- 配置自动备份间隔（建议 20-30 分钟）
- 测试 Git 同步功能

4. **配置 Obsidian 附件路径**

- 在 Obsidian 设置 → 文件与链接 → 附件默认存放路径
- 设置为：`Public/attachments`
- 确保所有插入的图片都保存到这个目录

### 阶段二：Next.js 项目初始化

1. **创建 Next.js 项目**
   ```bash
         npx create-next-app@latest . --typescript --tailwind --app
   ```




2. **安装依赖**
   ```bash
         npm install contentlayer next-contentlayer date-fns
         npm install lucide-react  # 图标库
         npm install -D @tailwindcss/typography
   ```




3. **配置 Contentlayer**

- 创建 `contentlayer.config.ts`
- 配置 `next.config.js` 集成 Contentlayer
- 创建 `tsconfig.json` 路径别名
- **注意**：如果遇到构建错误（React 18/19 兼容性问题），准备切换到备选方案

4. **设置内容目录（单一仓库方案）**

- 将 Obsidian 的 Public 目录内容复制到项目的 `content/Public/` 目录
- 或使用软链接：`ln -s /path/to/obsidian/Public content/Public`（仅本地开发）
- 确保 GitHub 仓库中包含完整的 Public 内容

5. **配置图片附件同步**

- 在 `package.json` 中添加 `prebuild` 脚本：
  ```json
  "prebuild": "cp -r content/Public/attachments public/attachments || true"
  ```
- 确保构建前附件已同步到 `public/attachments` 目录
- 配置 Contentlayer 的 rehype 插件转换图片路径

### 阶段三：页面开发

1. **Home 页面** (`app/page.tsx`)

- 读取所有 News 文档
- 按日期排序
- 支持标签筛选
- 文章卡片展示

2. **Notes 页面** (`app/notes/page.tsx`)

- 读取所有 Note 文档
- 时间线或网格布局
- 支持搜索和筛选

3. **About 页面** (`app/about/page.tsx`)

- 读取 `Public/Pages/about.md`
- 渲染 Markdown 内容

4. **组件开发**

- **UI 基础组件**：
  - Button（支持主要/次要/轮廓样式，带图标）
  - Card（统一卡片样式）
  - Icon（图标封装）
  
- **布局组件**：
  - Header/Footer 导航
  - Hero 横幅区域
  
- **内容组件**：
  - PostCard 文章卡片（使用 Card 组件）
  - PostList 文章列表
  - MarkdownContent Markdown 渲染
  - 搜索和筛选组件

### 阶段四：UI 设计和样式定制

1. **设计系统配置**

- **Tailwind CSS 主题定制**：
  - 自定义颜色系统（浅绿色、浅紫色、粉色、浅蓝色）
  - 圆角半径配置（统一使用较大的圆角值）
  - 字体配置（无衬线字体）
  - 阴影和间距系统

- **图标库选择**：
  - 推荐使用 `lucide-react` 或 `heroicons`（轻量、现代）
  - 支持箭头、勾选、其他常用图标

2. **UI 组件开发**

- **Button 组件**：
  - 主要按钮（粉色，带箭头图标）
  - 次要按钮（蓝色，带勾选图标）
  - 支持不同尺寸和变体

- **Card 组件**：
  - 白色背景，圆角设计
  - 支持缩略图、标题、日期、作者信息
  - 悬停效果

- **Hero 组件**：
  - 大横幅区域（浅绿色背景）
  - 左右分栏布局（文字+插画）
  - 装饰性元素（浮动圆圈、微芯片图案）

3. **页面布局实现**

- **Home 页面**：
  - Hero 区域（最新文章）
  - "Most Popular" 区域（横向卡片）
  - "Recent posts" 区域（左侧列表+右侧订阅）

- **Notes 页面**：
  - 时间线或网格布局
  - 保持一致的卡片风格

- **About 页面**：
  - 简洁的单页布局
  - 保持设计一致性

4. **装饰元素**

- 浮动圆圈装饰（浅蓝色、粉色）
- 微芯片图案（科技感）
- 抽象几何形状

### 阶段五：样式优化和 SEO

1. **Tailwind CSS 配置**

- 配置 `@tailwindcss/typography` 插件
- 完善响应式设计
- 优化动画和过渡效果

2. **SEO 优化**

- 添加 metadata
- Open Graph 标签
- 结构化数据

3. **性能优化**

- 图片优化（next/image）
- 代码分割
- 静态生成优化
- 图标和插画的优化加载

### 阶段六：部署配置

1. **Vercel 配置**

- 连接 GitHub 仓库
- 配置环境变量
- 设置构建命令

2. **GitHub Actions（可选）**

- 自动构建测试
- 内容验证

3. **Webhook 配置**

- GitHub → Vercel 自动构建
- 测试自动部署流程

## 关键配置文件

### `next.config.js`

```javascript
const { withContentlayer } = require('next-contentlayer')

module.exports = withContentlayer({
  // 图片路径重写（如果需要）
  async rewrites() {
    return [
      {
        source: '/attachments/:path*',
        destination: '/attachments/:path*',
      },
    ]
  },
})
```

### 图片附件同步脚本

**文件**: `scripts/sync-attachments.js`

```javascript
const fs = require('fs')
const path = require('path')

// 将 content/Public/attachments 同步到 public/attachments
const sourceDir = path.join(process.cwd(), 'content', 'Public', 'attachments')
const targetDir = path.join(process.cwd(), 'public', 'attachments')

if (fs.existsSync(sourceDir)) {
  // 确保目标目录存在
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }
  
  // 复制文件（或使用 cp -r 命令）
  // 这里可以使用 fs-extra 或直接执行 shell 命令
  console.log('Syncing attachments...')
}
```

**在 `package.json` 中添加构建脚本**:

```json
{
  "scripts": {
    "build": "node scripts/sync-attachments.js && next build",
    "dev": "node scripts/sync-attachments.js && next dev"
  }
}
```

**或者使用简单的 shell 命令**（推荐）:

在 `package.json` 中：
```json
{
  "scripts": {
    "prebuild": "cp -r content/Public/attachments public/attachments || true",
    "build": "next build"
  }
}
```



### `tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "contentlayer/generated": ["./.contentlayer/generated"]
    }
  },
  "include": [
    ".contentlayer/generated"
  ]
}
```



### `tailwind.config.js` - 设计系统配置

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 主色调：参考 zengzhang.ai 的配色方案
        primary: {
          green: '#A8E6CF',      // 浅绿色（Hero 背景）
          purple: '#C5A3FF',     // 浅紫色（插画背景）
          pink: '#FFB3BA',      // 粉色（主要按钮）
          blue: '#BAE1FF',       // 浅蓝色（次要按钮、装饰）
        },
        // 中性色
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      borderRadius: {
        // 统一使用较大的圆角值
        'card': '1rem',        // 卡片圆角
        'button': '0.75rem',   // 按钮圆角
        'hero': '1.5rem',      // Hero 区域圆角
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### `components/ui/Button.tsx` - 按钮组件

```typescript
import { ArrowRight, Check } from 'lucide-react'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  icon?: 'arrow' | 'check' | 'none'
  className?: string
  onClick?: () => void
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = 'arrow',
  className = '',
  onClick,
}: ButtonProps) {
  const baseStyles = 'rounded-button font-medium transition-all duration-200'
  
  const variantStyles = {
    primary: 'bg-primary-pink text-white hover:bg-primary-pink/90',
    secondary: 'bg-primary-blue text-white hover:bg-primary-blue/90',
    outline: 'border-2 border-primary-pink text-primary-pink hover:bg-primary-pink/10',
  }
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  const iconComponent = {
    arrow: <ArrowRight className="ml-2 h-5 w-5" />,
    check: <Check className="ml-2 h-5 w-5" />,
    none: null,
  }
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
    >
      <span className="flex items-center justify-center">
        {children}
        {iconComponent[icon]}
      </span>
    </button>
  )
}
```

### `components/ui/Card.tsx` - 卡片组件

```typescript
import Image from 'next/image'
import { ReactNode } from 'react'

interface CardProps {
  title: string
  date?: string
  author?: string
  thumbnail?: string
  description?: string
  children?: ReactNode
  className?: string
}

export function Card({
  title,
  date,
  author,
  thumbnail,
  description,
  children,
  className = '',
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-card p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200 ${className}`}
    >
      {thumbnail && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <Image
            src={thumbnail}
            alt={title}
            width={400}
            height={240}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">{title}</h3>
      {description && (
        <p className="text-neutral-600 mb-4 line-clamp-2">{description}</p>
      )}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        {date && <span>{date}</span>}
        {author && <span>{author}</span>}
      </div>
      {children}
    </div>
  )
}
```

### `components/Hero.tsx` - Hero 横幅组件

```typescript
import { Button } from './ui/Button'
import Image from 'next/image'

interface HeroProps {
  title: string
  description: string
  illustration?: string
  ctaText?: string
  ctaLink?: string
}

export function Hero({
  title,
  description,
  illustration,
  ctaText = 'READ THE LATEST',
  ctaLink = '#',
}: HeroProps) {
  return (
    <div className="bg-primary-green rounded-hero p-8 md:p-12 relative overflow-hidden">
      {/* 装饰性浮动圆圈 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-pink/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* 左侧文字内容 */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 leading-tight">
            {title}
          </h1>
          <p className="text-neutral-700 mb-6 text-lg">
            {description}
          </p>
          <Button variant="primary" size="lg" icon="arrow">
            {ctaText}
          </Button>
        </div>
        
        {/* 右侧插画 */}
        <div className="relative">
          {illustration && (
            <div className="bg-primary-purple/20 rounded-2xl p-8">
              <Image
                src={illustration}
                alt="Hero illustration"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### 图标库安装

```bash
npm install lucide-react
```

或者使用 Heroicons：

```bash
npm install @heroicons/react
```

### `.gitignore`

```javascript
Private/
.contentlayer/
.next/
node_modules/
```



## 工作流程

1. **内容创作**

- Python 萃取系统生成 Markdown → `/Inbox`
- 人工筛选后移动到 `/Public/News`
- 个人写作/小红书内容直接写到 `/Public/Notes`

2. **自动同步**

- Obsidian Git 插件自动提交并推送到 GitHub
- GitHub Webhook 触发 Vercel 构建

3. **自动部署**

- Vercel 自动构建 Next.js 项目
- Contentlayer 处理 Markdown 文件
- 生成静态网站并部署

## UI 设计规范（参考 zengzhang.ai）

### 设计风格特点

1. **整体风格**：
   - 友好、现代、科技感
   - 浅色背景，柔和的配色
   - 大量使用圆角设计
   - 卡通风格插画元素

2. **配色方案**：
   - **主色调**：
     - 浅绿色（`#A8E6CF`）：Hero 区域背景
     - 浅紫色（`#C5A3FF`）：插画背景、装饰
     - 粉色（`#FFB3BA`）：主要按钮、强调元素
     - 浅蓝色（`#BAE1FF`）：次要按钮、装饰圆圈
   - **中性色**：白色卡片、深灰色文字

3. **按钮设计**：
   - **主要按钮**：粉色背景，白色文字，右侧箭头图标（`>`）
   - **次要按钮**：蓝色背景，白色文字，右侧勾选图标（`✓`）
   - 统一圆角：`0.75rem`
   - 悬停效果：轻微透明度变化

4. **卡片设计**：
   - 白色背景，圆角 `1rem`
   - 轻微阴影（`shadow-card`）
   - 悬停时阴影加深（`shadow-card-hover`）
   - 包含：缩略图、标题、日期、作者信息

5. **布局特点**：
   - **Hero 区域**：大横幅，左右分栏（文字+插画），浅绿色背景
   - **内容区域**：白色卡片，横向排列（Most Popular），或左右分栏（Recent posts + Newsletter）
   - **装饰元素**：浮动圆圈、微芯片图案、抽象几何形状

6. **图标使用**：
   - 箭头图标（`ArrowRight`）：主要按钮、链接
   - 勾选图标（`Check`）：订阅按钮、完成状态
   - 使用 `lucide-react` 图标库（轻量、现代）

7. **字体和排版**：
   - 无衬线字体（Inter 或系统字体）
   - 清晰的层次结构（标题、正文、元信息）
   - 适当的行高和间距

### 实现要点

- 所有圆角统一使用 Tailwind 配置的值
- 按钮和卡片使用统一的组件，保持一致性
- 装饰元素使用绝对定位，不干扰内容布局
- 响应式设计：移动端堆叠布局，桌面端分栏布局
- 图片使用 Next.js Image 组件优化加载

## 需要确认的细节

1. **Obsidian 知识库路径**: 您的 Obsidian 知识库的完整路径是什么？
2. **现有内容迁移**: 是否需要将现有内容迁移到新的目录结构？
3. **GitHub 仓库策略**: 已确定采用单一仓库方案（代码+内容共存）
4. **小红书同步**: 同步脚本如何与 Obsidian 目录结构集成？
5. **图片处理**: Obsidian 中的图片附件如何处理？（建议放在 `Public/attachments/`）
6. **插画资源**: Hero 区域的插画是否需要自定义，还是使用占位图？

## 关键优化点

### 1. 图片与附件路径处理（最痛点）

**问题**：
- Obsidian 默认图片引用可能是 `![[image.png]]` 或相对路径
- Next.js 要求图片位于 `public/` 目录下才能通过 URL 访问

**解决方案**：

1. **Obsidian 配置**：
   - 在 Obsidian 设置中，将"附件默认存放路径"设为 `Public/attachments`
   - 这样所有插入的图片都会自动保存到这个目录

2. **构建时同步**：
   - 在 `package.json` 的 `prebuild` 脚本中添加：`cp -r content/Public/attachments public/attachments || true`
   - 确保构建前附件已同步到 public 目录

3. **Markdown 图片路径转换**：
   - 在 Contentlayer 的 MDX 处理中，添加自定义插件转换图片路径
   - 将 `![[image.png]]` 或 `![alt](attachments/image.png)` 转换为 `/attachments/image.png`

**Contentlayer 图片路径转换插件示例**：

```typescript
// lib/rehype-obsidian-images.ts
import { visit } from 'unist-util-visit'

export function rehypeObsidianImages() {
  return (tree: any) => {
    visit(tree, 'image', (node) => {
      // 转换 Obsidian 图片路径
      if (node.url.startsWith('attachments/') || node.url.includes('attachments/')) {
        node.url = node.url.replace(/^.*attachments\//, '/attachments/')
      }
      // 处理 ![[image.png]] 格式（如果 remark 已转换）
    })
  }
}
```

### 2. Contentlayer 维护状态风险提示

**风险**：
- Contentlayer 官方仓库近期更新缓慢
- 可能存在 React 18/19 适配问题
- 构建时可能遇到兼容性错误

**对策**：

1. **优先使用 Contentlayer**（当前方案）：
   - 如果遇到问题，及时反馈，我们可以切换到备选方案

2. **备选方案A：next-mdx-remote**：
   ```bash
   npm install next-mdx-remote
   ```
   - 运行时处理 MDX，更灵活
   - 需要手动实现类型定义和 frontmatter 解析

3. **备选方案B：remark + 自定义工具**：
   - 使用 `remark` + `remark-frontmatter` 解析
   - 手动实现类型安全和验证
   - 更轻量，完全可控

4. **备选方案C：MDX Bundle**：
   - 使用 `@mdx-js/loader` 直接处理
   - Next.js 13+ 原生支持

**如果遇到 Contentlayer 问题，我们可以快速切换到备选方案。**

### 3. Obsidian 特殊语法处理

**双向链接转换**：
- Obsidian 的 `[[链接]]` 需要转换为标准 Markdown 链接 `[链接](链接.md)`
- 可以使用 `remark-wiki-link` 插件处理

**标签处理**：
- Obsidian 的 `#标签` 可以保留，或转换为标准格式

## 注意事项

- Contentlayer 在构建时需要扫描所有 Markdown 文件，确保文件格式正确
- Obsidian 的双向链接语法 `[[链接]]` 需要转换为标准 Markdown 链接
- **图片路径必须通过构建脚本同步到 public 目录**
- Private 目录必须确保不会被 Git 提交（`.gitignore` 中配置）
- 单一仓库方案确保 Vercel 构建时能直接访问 Public 内容