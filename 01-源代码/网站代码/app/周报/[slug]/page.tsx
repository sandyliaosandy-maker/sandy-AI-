import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from '@/components/界面组件/图标'
import { allNewsletters, allNews, allNotes, type Newsletter, type News, type Note } from '../../../.contentlayer/generated'
import { MDXContent } from '@/components/内容组件/内容渲染'
import NewsletterContentList from '@/components/内容组件/周报内容列表'
import NewsletterAnalytics from '@/components/内容组件/周报访问统计'
import { parseNewsletterDisplayTitle } from '@/lib/parse-newsletter-title'

/**
 * 从新闻和笔记中提取原始链接
 * 返回一个映射对象：slug -> sourceUrl
 */
function extractSourceUrls(allNews: News[], allNotes: Note[]): Record<string, string> {
  const urlMap: Record<string, string> = {}

  allNews.forEach((news) => {
    if ('sourceUrl' in news && news.sourceUrl) {
      urlMap[news.slug] = news.sourceUrl as string
    } else if (news.body && 'raw' in news.body) {
      const bodyRaw = news.body.raw as string
      const linkMatch = bodyRaw.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/)
      if (linkMatch && linkMatch[2]) {
        urlMap[news.slug] = linkMatch[2]
      }
    }
  })

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
  return allNewsletters.map((newsletter: Newsletter) => {
    const slug = newsletter.slug || ''
    return {
      slug: slug,
    }
  })
}

export default async function NewsletterPage({ params }: PageProps) {
  const rawSlug = params.slug
  let decodedSlug: string
  try {
    decodedSlug = decodeURIComponent(rawSlug)
  } catch {
    decodedSlug = rawSlug
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[周报详情页] 参数:', {
      rawSlug,
      decodedSlug,
      allSlugs: allNewsletters.map((n: Newsletter) => n.slug),
      allTitles: allNewsletters.map((n: Newsletter) => n.title),
    })
  }

  const newsletter = allNewsletters.find((n: Newsletter) => {
    if (n.slug === rawSlug) return true
    if (n.slug === decodedSlug) return true
    try {
      if (n.slug === encodeURIComponent(rawSlug)) return true
    } catch {}
    try {
      const doubleDecoded = decodeURIComponent(decodedSlug)
      if (n.slug === doubleDecoded) return true
    } catch {}
    return false
  })

  if (!newsletter) {
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

  const { episodeLabel, headline } = parseNewsletterDisplayTitle(newsletter.title as string)

  return (
    <div className="min-h-screen bg-white">
      <NewsletterAnalytics newsletterSlug={newsletter.slug} />

      {/* 顶区：期号 + 居中主标题 + 日期（设计稿） */}
      <div className="mx-auto max-w-[720px] px-4 pb-2 pt-6 md:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-sm text-neutral-500 transition-colors hover:text-neutral-800"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          返回首页
        </Link>
        {episodeLabel ? (
          <p className="mb-3 text-sm font-medium text-orange-600">{episodeLabel}</p>
        ) : null}
        <h1 className="text-center text-[1.35rem] font-bold leading-snug text-neutral-900 sm:text-2xl md:text-[1.75rem] md:leading-tight">
          {headline}
        </h1>
        <p className="mt-4 text-center text-sm text-neutral-500">{formattedDate}</p>
        <div className="h-6 md:h-8" aria-hidden />
      </div>

      {/* 全宽封面图 */}
      {newsletter.coverImage ? (
        <div className="relative aspect-[21/9] w-full min-h-[200px] overflow-hidden bg-neutral-100 sm:min-h-[260px] md:max-h-[min(56vh,440px)]">
          <Image
            src={newsletter.coverImage}
            alt={newsletter.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
        {/* Welcome + 卷首语 */}
        {(() => {
          if (newsletter.editorialContent && 'code' in newsletter.editorialContent && newsletter.editorialContent.code) {
            return (
              <>
                <h2 className="mb-4 text-lg font-bold text-neutral-900">Welcome !</h2>
                <section className="prose prose-neutral max-w-none prose-p:text-neutral-700 prose-p:leading-relaxed prose-headings:font-bold">
                  <MDXContent code={newsletter.editorialContent.code} />
                </section>
                <hr className="my-10 border-neutral-200" />
              </>
            )
          }
          if (newsletter.body && 'code' in newsletter.body && newsletter.body.code) {
            const bodyRaw = ('raw' in newsletter.body ? newsletter.body.raw : '') || ''
            if (bodyRaw.trim()) {
              return (
                <>
                  <h2 className="mb-4 text-lg font-bold text-neutral-900">Welcome !</h2>
                  <section className="prose prose-neutral max-w-none prose-p:text-neutral-700 prose-p:leading-relaxed prose-headings:font-bold">
                    <MDXContent code={newsletter.body.code} />
                  </section>
                  <hr className="my-10 border-neutral-200" />
                </>
              )
            }
          }
          return <hr className="my-10 border-neutral-200" />
        })()}

        <section className="mb-12">
          <NewsletterContentList
            includedItems={newsletter.includedItems || '[]'}
            allNews={allNews}
            allNotes={allNotes}
            sourceUrlMap={extractSourceUrls(allNews, allNotes)}
            layout="feed"
          />
        </section>

        <div className="mt-12 border-t border-neutral-200 pt-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-blue-600 transition-colors hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
