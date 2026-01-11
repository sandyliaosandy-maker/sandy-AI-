# React 开发规范

本文档定义 React 组件开发规范和最佳实践。

## 组件类型

### 1. 服务端组件（Server Components）

**默认类型**，在服务端渲染，不需要 'use client' 指令。

```typescript
// ✅ 正确 - 服务端组件（默认）
import { allNews } from 'contentlayer/generated'

export default function NewsList() {
  const news = allNews
  
  return (
    <div>
      {news.map((item) => (
        <div key={item._id}>{item.title}</div>
      ))}
    </div>
  )
}
```

### 2. 客户端组件（Client Components）

需要交互性时使用，必须添加 'use client' 指令。

```typescript
// ✅ 正确 - 客户端组件
'use client'

import { useState } from 'react'

export function SearchBox() {
  const [query, setQuery] = useState('')
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="搜索..."
    />
  )
}
```

## 组件结构规范

### 1. 组件文件结构

```typescript
// components/内容组件/文章卡片.tsx
import Image from 'next/image'
import Link from 'next/link'
import type { News } from 'contentlayer/generated'

interface PostCardProps {
  post: News
  className?: string
}

export function PostCard({ post, className = '' }: PostCardProps) {
  return (
    <article className={`rounded-card bg-white p-6 ${className}`}>
      <Link href={`/新闻/${post.slug}`}>
        <h2 className="text-xl font-semibold">{post.title}</h2>
        {post.summary && (
          <p className="text-neutral-600 mt-2">{post.summary}</p>
        )}
        <time className="text-sm text-neutral-500">
          {new Date(post.date).toLocaleDateString('zh-CN')}
        </time>
      </Link>
    </article>
  )
}
```

### 2. 组件命名规范

- **组件名**：PascalCase（如 `PostCard`、`Header`）
- **文件名**：与组件名一致（如 `PostCard.tsx`）
- **Props 接口**：`组件名 + Props`（如 `PostCardProps`）

### 3. Props 类型定义

```typescript
// ✅ 正确 - 使用 interface
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  className?: string
}

// ✅ 也可以使用 type
type ButtonProps = {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}
```

## Hooks 使用规范

### 1. useState

```typescript
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  )
}
```

### 2. useEffect

```typescript
'use client'

import { useEffect, useState } from 'react'

export function ClientOnlyComponent() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  return <div>客户端内容</div>
}
```

### 3. 自定义 Hooks

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}
```

## 组件组合规范

### 1. 组件组合

```typescript
// ✅ 正确 - 使用 children
interface CardProps {
  children: React.ReactNode
  title?: string
}

export function Card({ children, title }: CardProps) {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}

// 使用
<Card title="标题">
  <p>内容</p>
</Card>
```

### 2. 组件复用

```typescript
// ✅ 正确 - 提取可复用组件
export function Button({ children, variant, ...props }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

## 条件渲染规范

### 1. 条件渲染

```typescript
// ✅ 正确
{isLoading && <Loading />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ✅ 三元运算符
{isLoading ? <Loading /> : <Content />}

// ✅ 早期返回
if (!data) {
  return <EmptyState />
}

return <DataDisplay data={data} />
```

### 2. 列表渲染

```typescript
// ✅ 正确 - 使用 key
{items.map((item) => (
  <ItemCard key={item.id} item={item} />
))}

// ✅ 正确 - 使用唯一标识
{posts.map((post) => (
  <PostCard key={post._id} post={post} />
))}
```

## 事件处理规范

### 1. 事件处理函数

```typescript
'use client'

export function Form() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // 处理提交
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 处理变化
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  )
}
```

### 2. 事件类型

```typescript
// 表单事件
React.FormEvent<HTMLFormElement>

// 输入事件
React.ChangeEvent<HTMLInputElement>
React.ChangeEvent<HTMLTextAreaElement>

// 鼠标事件
React.MouseEvent<HTMLButtonElement>

// 键盘事件
React.KeyboardEvent<HTMLInputElement>
```

## 性能优化规范

### 1. useMemo

```typescript
'use client'

import { useMemo } from 'react'

export function ExpensiveComponent({ items }: Props) {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.date - b.date)
  }, [items])
  
  return <div>{/* 使用 sortedItems */}</div>
}
```

### 2. useCallback

```typescript
'use client'

import { useCallback } from 'react'

export function ParentComponent() {
  const handleClick = useCallback(() => {
    // 处理点击
  }, [])
  
  return <ChildComponent onClick={handleClick} />
}
```

### 3. React.memo

```typescript
import { memo } from 'react'

export const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
}: Props) {
  return <div>{/* 渲染内容 */}</div>
})
```

## 错误处理规范

### 1. 错误边界（Error Boundary）

```typescript
'use client'

'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <div>出错了</div>
    }
    
    return this.props.children
  }
}
```

### 2. 错误处理

```typescript
'use client'

export function DataComponent() {
  const [error, setError] = useState<Error | null>(null)
  
  if (error) {
    return <ErrorMessage error={error} />
  }
  
  return <div>{/* 内容 */}</div>
}
```

## 组件组织规范

### 1. 组件目录结构

```
components/
├── 界面组件/          # UI 基础组件
│   ├── 按钮.tsx
│   └── 卡片.tsx
├── 布局组件/          # 布局相关
│   ├── 头部.tsx
│   └── 页脚.tsx
└── 内容组件/          # 内容展示
    ├── 文章卡片.tsx
    └── 文章列表.tsx
```

### 2. 组件导出

```typescript
// ✅ 正确 - 命名导出
export function Button() { }
export function Card() { }

// ✅ 正确 - 默认导出（页面组件）
export default function Page() { }
```

## 开发注意事项

### ✅ 正确做法

1. **优先使用服务端组件**：默认所有组件都是服务端组件
2. **类型安全**：所有 Props 都要有类型定义
3. **组件复用**：提取可复用的组件
4. **性能优化**：合理使用 useMemo、useCallback
5. **错误处理**：完善的错误边界

### ❌ 避免做法

1. **不要**在服务端组件中使用 Hooks
2. **不要**在服务端组件中使用浏览器 API
3. **不要**忽略 key 属性
4. **不要**在渲染中创建新对象/函数
5. **不要**过度使用 useMemo/useCallback

## 最佳实践总结

1. **服务端优先**：默认使用服务端组件
2. **类型安全**：充分利用 TypeScript
3. **组件复用**：提取可复用组件
4. **性能优化**：合理使用优化 Hooks
5. **错误处理**：完善的错误边界
6. **代码组织**：清晰的组件目录结构






