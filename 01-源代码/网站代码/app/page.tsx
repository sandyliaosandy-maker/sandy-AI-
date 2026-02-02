/**
 * 首页：Hero（最新一期）+ 往期周报横向列表 + 周报网格
 */
import * as fs from 'fs'
import * as path from 'path'
import Link from 'next/link'
import Image from 'next/image'
import { NewsletterList } from '@/components/内容组件/周报列表'
import { NewsletterHorizontalCard } from '@/components/内容组件/周报横向卡片'
import type { NewsletterDisplay } from '@/components/内容组件/周报卡片'

function getNewsletterDirCandidates(): string[] {
  const cwd = process.cwd()
  return [
    path.join(cwd, '内容', '公开内容', '周报'),
    path.join(cwd, '01-源代码', '网站代码', '内容', '公开内容', '周报'),
  ].filter((p, i, a) => a.indexOf(p) === i)
}

function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const block = match?.[1] ?? ''
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

async function getNewsletters(): Promise<NewsletterDisplay[]> {
  const list: NewsletterDisplay[] = []
  let candidates: string[] = []
  try {
    candidates = getNewsletterDirCandidates()
  } catch {
    return list
  }

  for (const dir of candidates) {
    try {
      if (!dir || !fs.existsSync(dir)) continue
      const files = fs.readdirSync(dir).filter((f) => typeof f === 'string' && f.endsWith('.md'))
      for (const file of files) {
        try {
          const fullPath = path.join(dir, file)
          if (!fs.existsSync(fullPath)) continue
          const raw = fs.readFileSync(fullPath, 'utf-8')
          const fm = parseFrontmatter(raw)
          const slug = path.basename(file, '.md')
          list.push({
            slug,
            title: (fm.title as string) ?? undefined,
            date: (fm.date as string) ?? undefined,
            coverImage: (fm.coverImage as string) ?? undefined,
            tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
            published: fm.published !== false,
            editorialContent: undefined,
            includedItems: undefined,
          })
        } catch {
          // 单文件解析失败则跳过，不影响其他周报
        }
      }
      if (list.length > 0) break
    } catch {
      continue
    }
  }

  return list
}

export default async function Home() {
  try {
    let list: NewsletterDisplay[] = []
    try {
      list = await getNewsletters()
    } catch {
      list = []
    }

    const published = (list || [])
      .filter((n) => n.published !== false)
      .sort((a, b) => {
        const tA = new Date(a.date || 0).getTime()
        const tB = new Date(b.date || 0).getTime()
        return tB - tA
      })

    const latest = published[0] ?? null
    const featured = published.slice(0, 4)

    return (
      <>
        {/* Hero：最新一期或空状态 */}
        <section className="w-full min-h-[50vh] md:min-h-[420px] bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center">
          <div className="container mx-auto max-w-7xl px-4 py-10 sm:py-12 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl">
              {latest ? (
                <>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight">
                    【Sandy的AI观察报】{latest.title ?? '最新一期'}
                  </h1>
                  <p className="text-neutral-300 text-sm md:text-base mb-2">
                    {new Date((latest.date as string) || '').toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-neutral-400 text-sm md:text-base mb-5 md:mb-6">
                    洞察与精选，每周更新
                  </p>
                  <Link
                    href={`/newsletter/${latest.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 min-h-[44px] px-5 py-3 border border-white/60 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                  >
                    阅读最新 →
                  </Link>
                </>
              ) : (
                <>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                    Sandy的AI观察报
                  </h1>
                  <p className="text-neutral-400 text-sm md:text-base mb-5 md:mb-6">
                    洞察与精选，每周更新。在管理页面创建你的第一份周报。
                  </p>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 min-h-[44px] px-5 py-3 border border-white/60 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                  >
                    前往管理页面 →
                  </Link>
                </>
              )}
            </div>
            {/* 右侧：最新一期封面图或占位 */}
            {latest?.coverImage ? (
              <div className="hidden lg:block relative flex-1 max-w-xl aspect-video rounded-lg overflow-hidden">
                <Image
                  src={latest.coverImage}
                  alt={latest.title ?? '最新一期封面'}
                  fill
                  sizes="(max-width: 1024px) 0vw, 50vw"
                  className="object-cover object-right"
                  priority
                />
              </div>
            ) : (
              <div className="hidden lg:block w-0 flex-1 max-w-md" aria-hidden />
            )}
          </div>
        </section>

        {/* 往期周报：横向卡片 */}
        <div className="container mx-auto max-w-7xl px-4 py-10 md:py-12">
          {featured.length > 0 && (
            <section className="mb-12 md:mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-neutral-800">往期周报</h2>
                <a href="#list" className="text-sm text-primary-blue hover:underline">
                  查看全部
                </a>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
                {featured.map((n) => (
                  <div key={n.slug} className="snap-start flex-shrink-0 w-[280px] md:w-auto min-w-[280px] md:min-w-0">
                    <NewsletterHorizontalCard newsletter={n} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 周报网格（全量） */}
          <section id="list">
            <header className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-2">周报列表</h2>
              <p className="text-sm text-neutral-500">共 {published.length} 期周报</p>
            </header>
            {published.length > 0 ? (
              <NewsletterList newsletters={published} />
            ) : (
              <div className="text-center py-20">
                <p className="text-6xl mb-4 opacity-40" aria-hidden>📋</p>
                <p className="text-neutral-600 text-lg mb-2">暂无周报</p>
                <p className="text-neutral-500 text-sm mb-6">在管理页面创建并发布你的第一份周报</p>
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-blue text-white rounded-lg font-medium hover:bg-primary-blue/90 transition-colors"
                >
                  前往管理页面
                </Link>
              </div>
            )}
          </section>
        </div>
      </>
    )
  } catch (err) {
    // 任何未预期的错误都显示 fallback，避免整页无法访问
    const msg = err instanceof Error ? err.message : String(err)
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl text-center">
        <h1 className="text-2xl font-bold text-neutral-800 mb-4">首页加载出错</h1>
        <p className="text-neutral-600 mb-4">{msg}</p>
        <a href="/admin" className="text-primary-blue hover:underline">前往管理页</a>
      </div>
    )
  }
}
