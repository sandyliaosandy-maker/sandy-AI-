# Contentlayer 开发规范

本文档定义 Contentlayer 内容管理和 Markdown 文件规范。

## Contentlayer 配置规范

### 1. 文档类型定义

```typescript
// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export const News = defineDocumentType(() => ({
  name: 'News',
  filePathPattern: '公开内容/新闻/**/*.md',
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
      resolve: (doc) => doc._raw.flattenedPath.replace('公开内容/新闻/', ''),
    },
  },
}))

export const Note = defineDocumentType(() => ({
  name: 'Note',
  filePathPattern: '公开内容/笔记/**/*.md',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    date: { type: 'date', required: true },
    tags: { type: 'list', of: { type: 'string' }, default: [] },
    source: { type: 'string', required: false },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('公开内容/笔记/', ''),
    },
  },
}))

export default makeSource({
  contentDirPath: '内容',
  documentTypes: [News, Note],
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

### 2. 字段类型规范

```typescript
// ✅ 支持的字段类型
{
  // 字符串
  title: { type: 'string', required: true },
  
  // 数字
  score: { type: 'number', required: false },
  
  // 日期
  date: { type: 'date', required: true },
  
  // 布尔值
  published: { type: 'boolean', required: false },
  
  // 列表
  tags: { type: 'list', of: { type: 'string' }, default: [] },
  
  // 嵌套对象
  author: {
    type: 'nested',
    of: {
      name: { type: 'string', required: true },
      email: { type: 'string', required: false },
    },
  },
}
```

## Markdown Frontmatter 规范

### 1. News 文章格式

```markdown
---
title: "DeepSeek 商业化分析"
date: 2023-10-27
tags: [AI, 商业]
score: 9.5
summary: "一句话摘要..."
---

正文内容...
```

### 2. Note 文章格式

```markdown
---
title: "我的小红书笔记标题"
date: 2024-01-15
tags: [生活, 分享]
source: "xiaohongshu"
---

正文内容...
```

### 3. Page 单页格式

```markdown
---
title: "关于我"
---

正文内容...
```

## 内容查询规范

### 1. 导入类型和数据

```typescript
// ✅ 正确 - 导入类型和数据
import { allNews, allNotes, type News, type Note } from 'contentlayer/generated'

// ✅ 正确 - 在服务端组件中使用
export default function Page() {
  const news = allNews
  return <div>{/* 使用数据 */}</div>
}
```

### 2. 数据过滤

```typescript
// ✅ 正确 - 按标签过滤
const aiNews = allNews.filter((news) => 
  news.tags?.includes('AI')
)

// ✅ 正确 - 按日期过滤
const recentNews = allNews.filter((news) => {
  const newsDate = new Date(news.date)
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  return newsDate >= oneMonthAgo
})
```

### 3. 数据排序

```typescript
// ✅ 正确 - 按日期排序（降序）
const sortedNews = allNews.sort((a, b) => 
  new Date(b.date).getTime() - new Date(a.date).getTime()
)

// ✅ 正确 - 按分数排序
const topNews = allNews.sort((a, b) => 
  (b.score || 0) - (a.score || 0)
)
```

### 4. 数据查找

```typescript
// ✅ 正确 - 根据 slug 查找
const note = allNotes.find((n) => n.slug === slug)

if (!note) {
  notFound()
}
```

## Markdown 内容规范

### 1. 图片引用

```markdown
<!-- ✅ 正确 - 使用相对路径 -->
![图片描述](../附件/image.png)

<!-- ✅ 正确 - 使用绝对路径（构建后） -->
![图片描述](/attachments/image.png)

<!-- ❌ 错误 - Obsidian 格式 -->
![[image.png]]
```

### 2. 链接引用

```markdown
<!-- ✅ 正确 - 标准 Markdown 链接 -->
[链接文本](链接地址)

<!-- ✅ 正确 - 内部链接 -->
[另一篇文章](./另一篇文章.md)

<!-- ❌ 错误 - Obsidian 双向链接 -->
[[另一篇文章]]
```

### 3. 代码块

```markdown
<!-- ✅ 正确 - 带语言标识 -->
```typescript
const code = 'example'
```

<!-- ✅ 正确 - 行内代码 -->
使用 `code` 示例
```

## 图片路径处理

### 1. Obsidian 配置

在 Obsidian 设置中：
- **附件默认存放路径**: `公开内容/附件`
- 确保所有插入的图片都保存到这个目录

### 2. 构建时同步

```json
// package.json
{
  "scripts": {
    "prebuild": "cp -r 内容/公开内容/附件 public/attachments || true",
    "build": "next build"
  }
}
```

### 3. 路径转换

```typescript
// lib/rehype-obsidian-images.ts
import { visit } from 'unist-util-visit'

export function rehypeObsidianImages() {
  return (tree: any) => {
    visit(tree, 'image', (node) => {
      // 转换 Obsidian 图片路径
      if (node.url.startsWith('附件/') || node.url.includes('附件/')) {
        node.url = node.url.replace(/^.*附件\//, '/attachments/')
      }
    })
  }
}
```

## 内容组织规范

### 1. 目录结构

```
内容/
└── 公开内容/
    ├── 新闻/          # News 类型
    │   └── *.md
    ├── 笔记/          # Note 类型
    │   └── *.md
    ├── 页面/          # Page 类型
    │   └── *.md
    └── 附件/          # 图片附件
        └── *.png
```

### 2. 文件命名

```markdown
# ✅ 正确 - 使用有意义的文件名
2024-01-15-DeepSeek商业化分析.md
2024-01-16-小红书笔记.md

# ✅ 正确 - 使用 slug 格式
deepseek-commercialization.md
xiaohongshu-note.md
```

## 类型安全规范

### 1. 使用生成的类型

```typescript
// ✅ 正确 - 使用 Contentlayer 生成的类型
import type { News, Note } from 'contentlayer/generated'

function NewsCard({ news }: { news: News }) {
  return <div>{news.title}</div>
}
```

### 2. 类型检查

```typescript
// ✅ 正确 - 类型守卫
function isNews(item: unknown): item is News {
  return (
    typeof item === 'object' &&
    item !== null &&
    'title' in item &&
    'date' in item &&
    '_id' in item
  )
}
```

## 开发注意事项

### ✅ 正确做法

1. **Frontmatter 规范**：所有 Markdown 文件必须包含正确的 Frontmatter
2. **类型安全**：使用 Contentlayer 生成的类型
3. **图片路径**：使用构建后的绝对路径
4. **内容组织**：按类型组织到对应目录
5. **文件命名**：使用有意义的文件名

### ❌ 避免做法

1. **不要**在 Markdown 中使用 Obsidian 特定语法（如 `[[链接]]`）
2. **不要**直接操作文件系统读取内容
3. **不要**忽略 Frontmatter 字段类型
4. **不要**使用相对路径引用图片（构建后）
5. **不要**在内容中硬编码路径

## 最佳实践总结

1. **类型安全**：使用 Contentlayer 生成的类型
2. **Frontmatter 规范**：遵循字段类型定义
3. **图片处理**：构建时同步到 public 目录
4. **内容组织**：按类型清晰组织
5. **路径规范**：使用构建后的绝对路径
6. **Markdown 规范**：使用标准 Markdown 语法






