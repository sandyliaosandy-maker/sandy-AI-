// 安全地导入 Contentlayer 数据
let allPages: any[] = []
try {
  const contentlayerModule = require('../../.contentlayer/generated')
  allPages = contentlayerModule.allPages || []
} catch (error) {
  allPages = []
}

import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/内容组件/内容渲染'

export const metadata = {
  title: '关于 - Sandy的AI收藏夹',
  description: '关于 Sandy的AI收藏夹',
}

export default function AboutPage() {
  const aboutPage = allPages.find((page: any) => page.slug === '关于')

  if (!aboutPage) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article className="prose prose-lg max-w-none">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-8">
          {aboutPage.title}
        </h1>
        <MDXContent code={aboutPage.body.code} />
      </article>
    </div>
  )
}

