import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Tag, ArrowLeft } from '@/components/界面组件/图标'
import { allNewsletters, allNews, allNotes, type Newsletter, type News, type Note } from '../../../.contentlayer/generated'
import { MDXContent } from '@/components/内容组件/内容渲染'
import NewsletterContentList from '@/components/内容组件/周报内容列表'
import NewsletterAnalytics from '@/components/内容组件/周报访问统计'
// 暂时注释掉付费内容相关功能（支付功能暂不开发）
// import { PremiumBadge } from '@/components/内容组件/会员标签'
// import { PremiumContentPreview } from '@/components/内容组件/付费内容预览'
// import { checkContentAccess } from '@/lib/access-control'
// import { getCurrentUser } from '@/lib/auth'

/**
 * 从新闻和笔记中提取原始链接
 * 返回一个映射对象：slug -> sourceUrl
 */
function extractSourceUrls(allNews: News[], allNotes: Note[]): Record<string, string> {
  const urlMap: Record<string, string> = {}
  
  // 处理新闻
  allNews.forEach((news) => {
    // 优先使用 sourceUrl 字段
    if ('sourceUrl' in news && news.sourceUrl) {
      urlMap[news.slug] = news.sourceUrl as string
    } else if (news.body && 'raw' in news.body) {
      // 从正文中提取第一个链接（通常在"## 原标题"部分）
      const bodyRaw = news.body.raw as string
      const linkMatch = bodyRaw.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/)
      if (linkMatch && linkMatch[2]) {
        urlMap[news.slug] = linkMatch[2]
      }
    }
  })
  
  // 处理笔记（如果有 sourceUrl）
  allNotes.forEach((note) => {
    if ('sourceUrl' in note && note.sourceUrl) {
      urlMap[note.slug] = note.sourceUrl as string
    }
  })
  
  return urlMap
}

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  // 生成静态路径参数
  // Next.js 会自动处理 URL 编码，所以直接使用 slug 即可
  return allNewsletters.map((newsletter: Newsletter) => {
    // 确保 slug 是正确的字符串
    const slug = newsletter.slug || ''
    return {
      slug: slug,
    }
  })
}

export default async function NewsletterPage({ params }: PageProps) {
  // 处理 URL 参数（Next.js 可能已经解码，也可能没有）
  // 尝试多种匹配方式
  const rawSlug = params.slug
  let decodedSlug: string
  try {
    decodedSlug = decodeURIComponent(rawSlug)
  } catch {
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
  
  // 尝试多种匹配方式
  const newsletter = allNewsletters.find((n: Newsletter) => {
    // 1. 精确匹配原始 slug
    if (n.slug === rawSlug) return true
    // 2. 匹配解码后的 slug
    if (n.slug === decodedSlug) return true
    // 3. 尝试编码匹配（以防 Next.js 自动编码了）
    try {
      if (n.slug === encodeURIComponent(rawSlug)) return true
    } catch {}
    // 4. 尝试双重解码（处理双重编码的情况）
    try {
      const doubleDecoded = decodeURIComponent(decodedSlug)
      if (n.slug === doubleDecoded) return true
    } catch {}
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

  // 暂时注释掉付费内容检查（支付功能暂不开发）
  // const isPremium = (newsletter as any).isPremium === true
  // const previewLength = (newsletter as any).previewLength || 500
  // const user = await getCurrentUser()
  // const accessResult = await checkContentAccess(isPremium, user?.id)

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
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 flex-1">
              {newsletter.title}
            </h1>
            {/* 暂时注释掉付费标签（支付功能暂不开发） */}
            {/* {isPremium && <PremiumBadge />} */}
          </div>

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
        {(() => {
          // 优先使用 editorialContent 字段
          if (newsletter.editorialContent && 'code' in newsletter.editorialContent && newsletter.editorialContent.code) {
            return (
              <section className="mb-12 prose prose-lg max-w-none">
                <MDXContent code={newsletter.editorialContent.code} />
              </section>
            )
          }
          
          // 如果没有 editorialContent，尝试从 body 中提取（兼容旧格式）
          if (newsletter.body && 'code' in newsletter.body && newsletter.body.code) {
            const bodyRaw = ('raw' in newsletter.body ? newsletter.body.raw : '') || ''
            // 检查 body 是否包含卷首语内容
            // 提取 body 中"## 本期内容"之前的部分作为卷首语
            if (bodyRaw.trim()) {
              const contentIndex = bodyRaw.indexOf('## 本期内容')
              // 如果有"## 本期内容"，只显示之前的部分；否则显示全部
              const editorialText = contentIndex > 0 
                ? bodyRaw.substring(0, contentIndex).trim()
                : bodyRaw.trim()
              
              if (editorialText) {
                // 显示整个 body（包含卷首语和"## 本期内容"部分）
                // 注意：这可能会显示"## 本期内容"部分，但至少能显示卷首语
                return (
                  <section className="mb-12 prose prose-lg max-w-none">
                    <MDXContent code={newsletter.body.code} />
                  </section>
                )
              }
            }
          }
          
          return null
        })()}

        {/* 分隔线 */}
        <hr className="my-12 border-neutral-200" />

        {/* 内容列表 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-8">本期内容</h2>
          <NewsletterContentList 
            includedItems={newsletter.includedItems || '[]'} 
            allNews={allNews}
            allNotes={allNotes}
            sourceUrlMap={extractSourceUrls(allNews, allNotes)}
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

