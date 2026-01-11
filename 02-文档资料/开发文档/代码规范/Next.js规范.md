# Next.js 开发规范

本文档定义 Next.js 框架的使用规范和最佳实践。

## 项目概述

本项目使用 **Next.js 14+ App Router** 架构，采用静态站点生成（SSG）模式。

### 核心特性
- App Router（文件系统路由）
- 服务端组件（Server Components）
- 静态生成（Static Generation）
- 图片优化（next/image）
- API Routes（如需要）

## 目录结构

### App Router 目录（必须使用 `app/`）

```
app/
├── layout.tsx              # 根布局
├── page.tsx                # 首页
├── 笔记/
│   ├── page.tsx            # 笔记列表页
│   └── [别名]/
│       └── page.tsx        # 笔记详情页
├── 关于/
│   └── page.tsx            # 关于页面
└── api/                    # API Routes（如需要）
    └── revalidate/
        └── route.ts        # 重新验证接口
```

### 重要说明

⚠️ **框架限制**：
- `app/` 目录名必须使用英文（Next.js 框架要求）
- `public/` 目录名必须使用英文（Next.js 框架要求）
- 其他目录可以使用中文命名

## 页面组件规范

### 1. 页面组件结构

```typescript
// app/page.tsx
import { Metadata } from 'next'
import { allNews } from 'contentlayer/generated'
import { PostList } from '@/components/内容组件/文章列表'

// 元数据定义
export const metadata: Metadata = {
  title: '首页 - Sandy的AI收藏夹',
  description: '知识萃取系统内容展示',
}

// 页面组件（默认导出）
export default function HomePage() {
  // 数据获取（服务端）
  const news = allNews.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">最新内容</h1>
      <PostList posts={news} />
    </div>
  )
}
```

### 2. 动态路由页面

```typescript
// app/笔记/[别名]/page.tsx
import { notFound } from 'next/navigation'
import { allNotes } from 'contentlayer/generated'
import { MarkdownContent } from '@/components/内容组件/内容渲染'

interface PageProps {
  params: {
    别名: string
  }
}

export async function generateStaticParams() {
  return allNotes.map((note) => ({
    别名: note.slug,
  }))
}

export default function NoteDetailPage({ params }: PageProps) {
  const note = allNotes.find((n) => n.slug === params.别名)

  if (!note) {
    notFound()
  }

  return (
    <article className="prose prose-lg max-w-none">
      <h1>{note.title}</h1>
      <MarkdownContent content={note.body} />
    </article>
  )
}
```

### 3. 元数据生成

```typescript
// 静态元数据
export const metadata: Metadata = {
  title: '页面标题',
  description: '页面描述',
  openGraph: {
    title: 'Open Graph 标题',
    description: 'Open Graph 描述',
    images: ['/og-image.jpg'],
  },
}

// 动态元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const note = allNotes.find((n) => n.slug === params.别名)
  
  return {
    title: note?.title || '默认标题',
    description: note?.summary || '默认描述',
  }
}
```

## 布局组件规范

### 根布局（app/layout.tsx）

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/布局组件/头部'
import { Footer } from '@/components/布局组件/页脚'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sandy的AI收藏夹',
  description: '个人知识库网站',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

## 数据获取规范

### 1. 使用 Contentlayer 查询

```typescript
// ✅ 正确 - 在服务端组件中直接导入
import { allNews, allNotes } from 'contentlayer/generated'

export default function Page() {
  const news = allNews
  // 使用数据
}
```

### 2. 数据过滤和排序

```typescript
// 按日期排序
const sortedNews = allNews.sort((a, b) => 
  new Date(b.date).getTime() - new Date(a.date).getTime()
)

// 按标签过滤
const aiNews = allNews.filter((news) => 
  news.tags?.includes('AI')
)

// 获取最新文章
const latestNews = allNews
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5)
```

### 3. 数据查找

```typescript
// 根据 slug 查找
const note = allNotes.find((n) => n.slug === slug)

if (!note) {
  notFound() // Next.js 内置函数
}
```

## 图片处理规范

### 1. 使用 next/image

```typescript
import Image from 'next/image'

// ✅ 正确
<Image
  src="/attachments/image.png"
  alt="图片描述"
  width={800}
  height={600}
  className="rounded-lg"
/>

// ❌ 错误 - 不要使用 <img> 标签
<img src="/attachments/image.png" alt="描述" />
```

### 2. 图片优化配置

```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
}
```

## API Routes 规范（如需要）

### 1. 路由处理

```typescript
// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()
    
    revalidatePath(path)
    
    return NextResponse.json({ revalidated: true })
  } catch (error) {
    return NextResponse.json(
      { error: '重新验证失败' },
      { status: 500 }
    )
  }
}
```

### 2. 请求方法处理

```typescript
export async function GET() {
  // GET 请求处理
}

export async function POST(request: NextRequest) {
  // POST 请求处理
}
```

## 静态生成规范

### 1. generateStaticParams

```typescript
// 为动态路由生成静态参数
export async function generateStaticParams() {
  return allNotes.map((note) => ({
    别名: note.slug,
  }))
}
```

### 2. 静态生成配置

```typescript
// next.config.js
module.exports = {
  output: 'export', // 完全静态导出（如需要）
  // 或
  // 默认使用 SSG，按需使用 ISR
}
```

## 性能优化规范

### 1. 代码分割

- 使用动态导入（dynamic import）
- 按路由自动代码分割

```typescript
// 动态导入组件
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>加载中...</p>,
})
```

### 2. 图片优化

- 使用 `next/image` 组件
- 配置合适的图片尺寸
- 使用 WebP/AVIF 格式

### 3. 字体优化

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
```

## 错误处理规范

### 1. notFound()

```typescript
import { notFound } from 'next/navigation'

export default function Page({ params }: PageProps) {
  const note = allNotes.find((n) => n.slug === params.别名)
  
  if (!note) {
    notFound() // 显示 404 页面
  }
}
```

### 2. error.tsx

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>出错了</h2>
      <button onClick={() => reset()}>重试</button>
    </div>
  )
}
```

### 3. not-found.tsx

```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>页面未找到</h2>
    </div>
  )
}
```

## 配置规范

### next.config.js

```javascript
const { withContentlayer } = require('next-contentlayer')

module.exports = withContentlayer({
  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // 重写规则（如需要）
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

## 开发注意事项

### ✅ 正确做法

1. **使用服务端组件**：默认所有组件都是服务端组件
2. **静态生成优先**：尽可能使用静态生成
3. **类型安全**：充分利用 TypeScript
4. **元数据定义**：为每个页面定义 metadata
5. **图片优化**：使用 next/image

### ❌ 避免做法

1. **不要**在服务端组件中使用客户端 API（如 `window`、`document`）
2. **不要**在服务端组件中使用 `useState`、`useEffect` 等 Hooks
3. **不要**直接使用 `<img>` 标签
4. **不要**在页面组件中直接操作文件系统
5. **不要**忽略类型定义

## 最佳实践总结

1. **充分利用 App Router**：使用文件系统路由
2. **静态生成优先**：提高性能和 SEO
3. **类型安全**：所有代码都要有类型定义
4. **性能优化**：图片优化、代码分割、字体优化
5. **SEO 优化**：完善的 metadata 定义
6. **错误处理**：完善的错误边界和 404 处理






