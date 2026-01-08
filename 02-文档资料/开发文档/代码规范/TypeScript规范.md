# TypeScript 开发规范

本文档定义 TypeScript 编码规范和类型定义最佳实践。

## 类型定义规范

### 1. 接口（Interface）vs 类型别名（Type）

```typescript
// ✅ 推荐 - 使用 interface 定义对象类型
interface PostCardProps {
  post: News
  className?: string
  onClick?: () => void
}

// ✅ 推荐 - 使用 type 定义联合类型、交叉类型等
type ButtonVariant = 'primary' | 'secondary' | 'outline'
type Status = 'pending' | 'completed' | 'failed'

// ✅ 推荐 - 使用 type 定义函数类型
type EventHandler = (event: React.MouseEvent) => void
```

### 2. 类型导入

```typescript
// ✅ 正确 - 类型导入使用 import type
import type { News, Note } from 'contentlayer/generated'
import type { Metadata } from 'next'

// ✅ 正确 - 值和类型混合导入
import { allNews, type News } from 'contentlayer/generated'
```

### 3. 泛型使用

```typescript
// ✅ 正确 - 泛型函数
function getFirstItem<T>(items: T[]): T | undefined {
  return items[0]
}

// ✅ 正确 - 泛型组件
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

export function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}
```

## 类型定义规范

### 1. Contentlayer 类型

```typescript
// ✅ 正确 - 使用 Contentlayer 生成的类型
import type { News, Note, Page } from 'contentlayer/generated'

function NewsCard({ news }: { news: News }) {
  return <div>{news.title}</div>
}
```

### 2. React 类型

```typescript
// ✅ 正确 - Props 类型
interface ButtonProps {
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
}

// ✅ 正确 - 事件类型
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // 处理变化
}
```

### 3. Next.js 类型

```typescript
// ✅ 正确 - 页面 Props
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '页面标题',
}

// ✅ 正确 - 动态路由 Props
interface PageProps {
  params: {
    别名: string
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}
```

## 类型安全规范

### 1. 避免使用 any

```typescript
// ❌ 错误 - 使用 any
function processData(data: any) {
  return data.value
}

// ✅ 正确 - 定义具体类型
interface Data {
  value: string
}

function processData(data: Data) {
  return data.value
}

// ✅ 正确 - 使用 unknown（更安全）
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value
  }
  throw new Error('Invalid data')
}
```

### 2. 类型断言

```typescript
// ✅ 正确 - 使用类型断言（谨慎使用）
const element = document.getElementById('myId') as HTMLInputElement

// ✅ 正确 - 使用类型守卫
function isNews(item: unknown): item is News {
  return (
    typeof item === 'object' &&
    item !== null &&
    'title' in item &&
    'date' in item
  )
}

if (isNews(data)) {
  // data 现在是 News 类型
  console.log(data.title)
}
```

### 3. 可选属性

```typescript
// ✅ 正确 - 使用可选属性
interface PostCardProps {
  post: News
  className?: string  // 可选
  showDate?: boolean  // 可选
}

// ✅ 正确 - 使用默认值
function PostCard({ 
  post, 
  className = '', 
  showDate = true 
}: PostCardProps) {
  // ...
}
```

## 工具类型使用

### 1. 内置工具类型

```typescript
// Partial - 所有属性可选
type PartialPost = Partial<News>

// Pick - 选择属性
type PostTitle = Pick<News, 'title' | 'date'>

// Omit - 排除属性
type PostWithoutId = Omit<News, '_id'>

// Readonly - 只读
type ReadonlyPost = Readonly<News>
```

### 2. 自定义工具类型

```typescript
// ✅ 正确 - 自定义工具类型
type Nullable<T> = T | null
type Optional<T> = T | undefined

// ✅ 正确 - 条件类型
type NonNullable<T> = T extends null | undefined ? never : T
```

## 函数类型规范

### 1. 函数声明

```typescript
// ✅ 正确 - 函数声明
function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN')
}

// ✅ 正确 - 箭头函数
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN')
}
```

### 2. 异步函数

```typescript
// ✅ 正确 - 异步函数类型
async function fetchData(): Promise<News[]> {
  const response = await fetch('/api/news')
  return response.json()
}

// ✅ 正确 - 错误处理
async function fetchData(): Promise<News[] | null> {
  try {
    const response = await fetch('/api/news')
    return response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    return null
  }
}
```

## 类型定义文件

### 1. 全局类型定义

```typescript
// types/global.d.ts
declare global {
  interface Window {
    customProperty: string
  }
}

export {}
```

### 2. 模块类型定义

```typescript
// types/content.d.ts
export interface CustomPost {
  title: string
  content: string
  tags: string[]
}
```

## 配置规范

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".contentlayer/generated"],
  "exclude": ["node_modules"]
}
```

## 开发注意事项

### ✅ 正确做法

1. **充分利用类型系统**：为所有变量、函数、组件定义类型
2. **使用类型导入**：类型导入使用 `import type`
3. **避免 any**：尽量不使用 `any`，使用 `unknown` 更安全
4. **类型守卫**：使用类型守卫进行类型检查
5. **工具类型**：合理使用内置和自定义工具类型

### ❌ 避免做法

1. **不要**忽略类型定义
2. **不要**过度使用类型断言
3. **不要**使用 `any` 类型
4. **不要**忽略 strict 模式
5. **不要**混合使用 interface 和 type（保持一致性）

## 最佳实践总结

1. **类型安全优先**：充分利用 TypeScript 类型系统
2. **严格模式**：启用 strict 模式
3. **类型导入**：使用 `import type` 导入类型
4. **工具类型**：合理使用内置和自定义工具类型
5. **类型守卫**：使用类型守卫进行运行时类型检查
6. **避免 any**：尽量不使用 `any`，使用 `unknown` 更安全



