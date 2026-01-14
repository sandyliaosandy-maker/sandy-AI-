import { notFound } from 'next/navigation'
import { MDXContent } from '@/components/内容组件/内容渲染'
import type { Page } from '../../.contentlayer/generated'

export const metadata = {
  title: '关于 - Sandy的AI收藏夹',
  description: '关于 Sandy的AI收藏夹',
}

/**
 * 获取页面数据
 * 
 * 功能：
 * - 动态导入 Contentlayer 生成的数据
 * - 处理生成文件不存在或导入失败的情况
 * - 返回页面数组，如果导入失败则返回空数组
 */
async function getPages() {
  try {
    // 动态导入 Contentlayer 生成的数据
    const { allPages } = await import('../../.contentlayer/generated')
    return (allPages as Page[]) || []
  } catch (error) {
    // Contentlayer 数据尚未生成或导入失败，返回空数组
    console.error('[关于页面] Contentlayer 导入错误:', error)
    return []
  }
}

/**
 * 关于页面组件
 * 
 * 功能：
 * - 显示关于页面的内容
 * - 从 Contentlayer 读取页面数据
 * - 支持静态生成（SSG）
 */
export default async function AboutPage() {
  // 立即输出日志，确认页面是否被执行
  console.log('[关于页面] 页面组件执行')
  
  // 获取页面数据
  const allPages = await getPages()
  
  // 调试信息（仅在开发环境）
  console.log('[关于页面] 数据加载:', {
    pagesCount: allPages.length,
    pageSlugs: allPages.map((p: Page) => p.slug),
    pageTitles: allPages.map((p: Page) => p.title),
  })
  
  // 查找 slug 为 '关于' 的页面
  const aboutPage = allPages.find((page: Page) => page.slug === '关于')

  if (!aboutPage) {
    // 如果找不到页面，输出详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('[关于页面] 未找到页面:', {
        availableSlugs: allPages.map((p: Page) => p.slug),
        searchingFor: '关于',
      })
    }
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

