/**
 * 周报详情页
 * 路径: /newsletter/[slug]
 * - 优先从 Contentlayer 查找；找不到则从 内容/公开内容/周报/*.md 按 slug 回退
 * - slug 匹配时忽略全角冒号差异（ep03： 与 ep03 视为同一条）
 */
import * as fs from 'fs'
import * as path from 'path'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Calendar, Tag, ArrowLeft } from '@/components/界面组件/图标'
import { allNewsletters, allNews, allNotes, type Newsletter, type News, type Note } from '../../../.contentlayer/generated'
import { MDXContent } from '@/components/内容组件/内容渲染'
import NewsletterContentList from '@/components/内容组件/周报内容列表'
import NewsletterAnalytics from '@/components/内容组件/周报访问统计'

/** 统一 slug 比较：去掉全角冒号，便于「ep03：」与「ep03」匹配 */
function normalizeSlug(s: string): string {
  return (s || '').replace(/\uFF1A/g, '')
}

function extractSourceUrls(allNews: News[], allNotes: Note[]): Record<string, string> {
  const urlMap: Record<string, string> = {}
  allNews.forEach((news) => {
    if ('sourceUrl' in news && news.sourceUrl) urlMap[news.slug] = news.sourceUrl as string
    else if (news.body && 'raw' in news.body) {
      const bodyRaw = news.body.raw as string
      const linkMatch = bodyRaw.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/)
      if (linkMatch?.[2]) urlMap[news.slug] = linkMatch[2]
    }
  })
  allNotes.forEach((note) => {
    if ('sourceUrl' in note && note.sourceUrl) urlMap[note.slug] = note.sourceUrl as string
  })
  return urlMap
}

function getNewsletterDirCandidates(): string[] {
  const cwd = process.cwd()
  return [
    path.join(cwd, '内容', '公开内容', '周报'),
    path.join(cwd, '01-源代码', '网站代码', '内容', '公开内容', '周报'),
  ].filter((p, i, a) => a.indexOf(p) === i)
}

function parseFrontmatter(block: string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^(\w+):\s*(.*)$/)
    if (!m) continue
    const [, key, value] = m
    let v: unknown = value.trim()
    if (value.startsWith('"') && value.endsWith('"')) v = value.slice(1, -1).replace(/\\"/g, '"')
    else if (value.startsWith("'") && value.endsWith("'")) v = value.slice(1, -1)
    else if (value === 'true') v = true
    else if (value === 'false') v = false
    else if (/^\d{4}-\d{2}-\d{2}/.test(value)) v = value
    out[key] = v
  }
  return out
}

/** 从磁盘按 slug 查找并解析周报；找不到返回 null */
function getNewsletterFromFs(decodedSlug: string): {
  slug: string
  title: string
  date: string
  coverImage?: string
  tags: string[]
  includedItems: string
  bodyRaw: string
} | null {
  const normalized = normalizeSlug(decodedSlug)
  const candidates = getNewsletterDirCandidates()

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
    for (const file of files) {
      const fileSlug = path.basename(file, '.md')
      if (normalizeSlug(fileSlug) !== normalized) continue
      try {
        const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
        const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
        const fm = match ? parseFrontmatter(match[1]) : {}
        const bodyRaw = match ? match[2].trim() : ''
        return {
          slug: fileSlug,
          title: (fm.title as string) ?? fileSlug,
          date: (fm.date as string) ?? '',
          coverImage: fm.coverImage as string | undefined,
          tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
          includedItems: typeof fm.includedItems === 'string' ? fm.includedItems : '[]',
          bodyRaw,
        }
      } catch {
        continue
      }
    }
  }
  return null
}

interface PageProps {
  params: { slug: string }
}

export default async function NewsletterPage({ params }: PageProps) {
  const rawSlug = params.slug
  let decodedSlug: string
  try {
    decodedSlug = decodeURIComponent(rawSlug)
  } catch {
    decodedSlug = rawSlug
  }

  const normalized = normalizeSlug(decodedSlug)
  const newsletter: Newsletter | null = allNewsletters.find((n: Newsletter) => {
    if (n.slug === rawSlug || n.slug === decodedSlug) return true
    if (normalizeSlug(n.slug) === normalized) return true
    try {
      if (n.slug === encodeURIComponent(rawSlug)) return true
    } catch {
      // ignore
    }
    return false
  }) as Newsletter | null

  let fromFs: ReturnType<typeof getNewsletterFromFs> = null
  if (!newsletter) {
    fromFs = getNewsletterFromFs(decodedSlug)
    if (!fromFs) notFound()
  }

  const slug = newsletter ? newsletter.slug : fromFs!.slug
  const title = newsletter ? (newsletter.title as string) : fromFs!.title
  const dateStr = newsletter ? (newsletter.date as string) : fromFs!.date
  const coverImage = newsletter ? newsletter.coverImage : fromFs!.coverImage
  const tags = newsletter ? (newsletter.tags || []) : fromFs!.tags
  const includedItems = newsletter ? (newsletter.includedItems || '[]') : fromFs!.includedItems

  const formattedDate = new Date(dateStr || '').toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const sourceUrlMap = extractSourceUrls(allNews, allNotes)

  return (
    <div className="min-h-screen bg-white">
      <NewsletterAnalytics newsletterSlug={slug} />
      {coverImage && (
        <div className="relative w-full h-96 md:h-[500px]">
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-neutral-600 hover:text-neutral-800 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </Link>
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-6">{title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time>{formattedDate}</time>
            </div>
            {tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4" />
                {tags.map((tag: string) => (
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

        {/* 卷首语 / 正文 */}
        {fromFs ? (
          fromFs.bodyRaw ? (
            <section className="mb-12 prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm as any]}>{fromFs.bodyRaw}</ReactMarkdown>
            </section>
          ) : null
        ) : newsletter && (newsletter.editorialContent && 'code' in newsletter.editorialContent && newsletter.editorialContent.code) ? (
          <section className="mb-12 prose prose-lg max-w-none">
            <MDXContent code={newsletter.editorialContent.code} />
          </section>
        ) : newsletter?.body && 'code' in newsletter.body && newsletter.body.code ? (
          <section className="mb-12 prose prose-lg max-w-none">
            <MDXContent code={newsletter.body.code} />
          </section>
        ) : null}

        <hr className="my-12 border-neutral-200" />
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-8">本期内容</h2>
          <NewsletterContentList
            includedItems={includedItems}
            allNews={allNews}
            allNotes={allNotes}
            sourceUrlMap={sourceUrlMap}
          />
        </section>
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
