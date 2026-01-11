# Tailwind CSS 开发规范

本文档定义 Tailwind CSS 样式开发规范和最佳实践。

## 配置规范

### 1. tailwind.config.js

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
        primary: {
          green: '#A8E6CF',      // 浅绿色（Hero 背景）
          purple: '#C5A3FF',     // 浅紫色（插画背景）
          pink: '#FFB3BA',       // 粉色（主要按钮）
          blue: '#BAE1FF',       // 浅蓝色（次要按钮、装饰）
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          // ... 其他中性色
          900: '#171717',
        },
      },
      borderRadius: {
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

## 类名使用规范

### 1. 基础类名

```typescript
// ✅ 正确 - 使用 Tailwind 类名
<div className="container mx-auto px-4">
  <h1 className="text-3xl font-bold mb-6">标题</h1>
  <p className="text-neutral-600">正文</p>
</div>

// ❌ 错误 - 不要使用内联样式
<div style={{ margin: '0 auto', padding: '1rem' }}>
```

### 2. 响应式设计

```typescript
// ✅ 正确 - 使用响应式前缀
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 内容 */}
</div>

// ✅ 正确 - 移动端优先
<div className="text-sm md:text-base lg:text-lg">
  响应式文本
</div>
```

### 3. 状态变体

```typescript
// ✅ 正确 - 使用状态变体
<button className="bg-primary-pink hover:bg-primary-pink/90 active:bg-primary-pink/80">
  按钮
</button>

// ✅ 正确 - 使用 focus 状态
<input className="focus:ring-2 focus:ring-primary-blue focus:outline-none" />
```

## 组件样式规范

### 1. 按钮样式

```typescript
// ✅ 正确 - 使用配置的颜色和圆角
<button className="bg-primary-pink text-white rounded-button px-6 py-3 hover:bg-primary-pink/90 transition-colors">
  主要按钮
</button>

<button className="bg-primary-blue text-white rounded-button px-6 py-3 hover:bg-primary-blue/90 transition-colors">
  次要按钮
</button>
```

### 2. 卡片样式

```typescript
// ✅ 正确 - 使用配置的样式
<div className="bg-white rounded-card p-6 shadow-card hover:shadow-card-hover transition-shadow">
  {/* 卡片内容 */}
</div>
```

### 3. 布局样式

```typescript
// ✅ 正确 - 使用容器和间距
<div className="container mx-auto px-4 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* 内容 */}
  </div>
</div>
```

## Typography 插件使用

### 1. 文章内容样式

```typescript
// ✅ 正确 - 使用 typography 插件
<article className="prose prose-lg max-w-none">
  <h1>标题</h1>
  <p>正文内容...</p>
</article>

// ✅ 正确 - 自定义 typography 样式
<article className="prose prose-lg prose-neutral max-w-none">
  {/* 内容 */}
</article>
```

### 2. Typography 配置

```javascript
// tailwind.config.js
module.exports = {
  plugins: [
    require('@tailwindcss/typography')({
      target: 'modern',
    }),
  ],
}
```

## 自定义类名规范

### 1. 使用 @apply

```css
/* globals.css */
@layer components {
  .btn-primary {
    @apply bg-primary-pink text-white rounded-button px-6 py-3 hover:bg-primary-pink/90 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-card p-6 shadow-card hover:shadow-card-hover transition-shadow;
  }
}
```

### 2. 使用组件类

```typescript
// ✅ 正确 - 使用自定义类
<button className="btn-primary">按钮</button>
<div className="card">卡片</div>
```

## 颜色使用规范

### 1. 使用主题颜色

```typescript
// ✅ 正确 - 使用配置的主题颜色
<div className="bg-primary-green text-white">
  Hero 区域
</div>

<button className="bg-primary-pink text-white">
  主要按钮
</button>

// ❌ 错误 - 不要硬编码颜色
<div className="bg-[#A8E6CF]">
```

### 2. 透明度使用

```typescript
// ✅ 正确 - 使用透明度
<div className="bg-primary-blue/30">
  半透明背景
</div>

<div className="bg-white/80 backdrop-blur-sm">
  毛玻璃效果
</div>
```

## 间距规范

### 1. 使用间距系统

```typescript
// ✅ 正确 - 使用 Tailwind 间距系统
<div className="p-4 m-4">      // padding: 1rem, margin: 1rem
<div className="px-6 py-3">     // padding-x: 1.5rem, padding-y: 0.75rem
<div className="space-y-4">     // 子元素垂直间距
<div className="gap-6">        // Grid/Flex 间距
```

### 2. 响应式间距

```typescript
// ✅ 正确 - 响应式间距
<div className="p-4 md:p-6 lg:p-8">
  响应式内边距
</div>
```

## 开发注意事项

### ✅ 正确做法

1. **使用 Tailwind 类名**：优先使用 Tailwind 工具类
2. **响应式设计**：移动端优先，使用响应式前缀
3. **主题颜色**：使用配置的主题颜色
4. **组件样式**：使用 @apply 创建可复用样式
5. **Typography**：使用 typography 插件处理文章内容

### ❌ 避免做法

1. **不要**使用内联样式（style 属性）
2. **不要**硬编码颜色值
3. **不要**创建大量自定义 CSS
4. **不要**忽略响应式设计
5. **不要**过度使用 !important

## 最佳实践总结

1. **工具类优先**：优先使用 Tailwind 工具类
2. **响应式设计**：移动端优先，渐进增强
3. **主题配置**：使用配置的主题颜色和样式
4. **组件样式**：使用 @apply 创建可复用样式
5. **Typography**：使用 typography 插件处理内容样式
6. **性能优化**：利用 Tailwind 的 JIT 模式






