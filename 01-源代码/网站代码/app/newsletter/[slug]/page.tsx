/**
 * 周报详情页
 * 路径: /newsletter/[slug]
 * 
 * 功能：
 * - 显示周报的完整内容，包括封面图、标题、元信息、卷首语和包含的内容列表
 * - 支持静态生成，提升性能
 * - 处理中文路径的 URL 编码问题
 */
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Tag, ArrowLeft } from '@/components/界面组件/图标'
import { allNewsletters, allNews, allNotes, type Newsletter } from '../../../.contentlayer/generated'
import { MDXContent } from '@/components/内容组件/内容渲染'
import NewsletterContentList from '@/components/内容组件/周报内容列表'
import NewsletterAnalytics from '@/components/内容组件/周报访问统计'

interface PageProps {
  params: {
    slug: string // URL 中的 slug 参数，可能是编码后的中文
  }
}

/**
 * 生成静态路径参数
 * Next.js 在构建时会为每个周报生成静态页面
 * 
 * @returns 所有周报的 slug 数组，用于静态生成
 */
export async function generateStaticParams() {
  return allNewsletters.map((newsletter: Newsletter) => {
    // 确保 slug 是正确的字符串，避免 undefined
    const slug = newsletter.slug || ''
    return {
      slug: slug,
    }
  })
}

/**
 * 周报详情页组件
 * 
 * @param params - 路由参数，包含 slug
 * @returns 周报详情页的 JSX
 */
export default function NewsletterPage({ params }: PageProps) {
  // 处理 URL 参数（Next.js 可能已经解码，也可能没有）
  // 由于中文路径在 URL 中会被编码，需要尝试多种匹配方式
  const rawSlug = params.slug
  let decodedSlug: string
  try {
    // 尝试解码 URL 参数（处理中文路径编码）
    decodedSlug = decodeURIComponent(rawSlug)
  } catch {
    // 如果解码失败，使用原始值
    decodedSlug = rawSlug
  }
  
  // 调试信息（仅在开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('[周报详情页] 参数:', {
      rawSlug,
      decodedSlug,
      allSlugs: allNewsletters.map((n: Newsletter) => n.slug),
      allTitles: allNewsletters.map((n: Newsletter) => n.title),
    })
  }
  
  // 尝试多种匹配方式，确保能找到对应的周报
  // 这是因为 Next.js 在处理中文路径时，URL 编码可能不一致
  const newsletter = allNewsletters.find((n: Newsletter) => {
    // 1. 精确匹配原始 slug（Next.js 可能已经解码）
    if (n.slug === rawSlug) return true
    // 2. 匹配解码后的 slug（处理 URL 编码）
    if (n.slug === decodedSlug) return true
    // 3. 尝试编码匹配（以防 Next.js 自动编码了）
    try {
      if (n.slug === encodeURIComponent(rawSlug)) return true
    } catch {
      // 编码失败，忽略
    }
    // 4. 尝试双重解码（处理双重编码的情况）
    try {
      const doubleDecoded = decodeURIComponent(decodedSlug)
      if (n.slug === doubleDecoded) return true
    } catch {
      // 解码失败，忽略
    }
    return false
  })

  if (!newsletter) {
    // 如果还是找不到，输出详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('[周报详情页] 未找到周报:', {
        rawSlug,
        decodedSlug,
        availableSlugs: allNewsletters.map((n: Newsletter) => n.slug),
      })
    }
    notFound()
  }

  const formattedDate = new Date(newsletter.date as string).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // 调试信息（仅在开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('[周报详情页] 周报信息:', {
      title: newsletter.title,
      slug: newsletter.slug,
      hasIncludedItems: !!newsletter.includedItems,
      includedItemsLength: newsletter.includedItems?.length,
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 访问统计埋点 */}
      <NewsletterAnalytics newsletterSlug={newsletter.slug} />
      
      {/* 封面图 */}
      {newsletter.coverImage && (
        <div className="relative w-full h-96 md:h-[500px]">
          <Image
            src={newsletter.coverImage}
            alt={newsletter.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center text-neutral-600 hover:text-neutral-800 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Link>

        {/* 标题和元信息 */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">
            {newsletter.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time>{formattedDate}</time>
            </div>
            {newsletter.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4" />
                {newsletter.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-primary-blue/20 text-primary-blue rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* 卷首语 */}
        {newsletter.editorialContent && 'code' in newsletter.editorialContent && newsletter.editorialContent.code && (
          <section className="mb-12 prose prose-lg max-w-none">
            <MDXContent code={newsletter.editorialContent.code} />
          </section>
        )}

        {/* 分隔线 */}
        <hr className="my-12 border-neutral-200" />

        {/* 内容列表 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-8">本期内容</h2>
          <NewsletterContentList 
            includedItems={newsletter.includedItems || '[]'} 
            allNews={allNews}
            allNotes={allNotes}
          />
        </section>

        {/* 底部导航 */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <Link
            href="/"
            className="inline-flex items-center text-primary-blue hover:text-primary-pink transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
