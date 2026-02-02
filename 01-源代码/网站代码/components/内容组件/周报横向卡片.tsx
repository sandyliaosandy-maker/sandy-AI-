/**
 * 周报横向卡片（往期/精选区用）
 * 小方图 + 标题 + 日期，整卡可点击到详情页
 */
import Link from 'next/link'
import Image from 'next/image'
import type { NewsletterDisplay } from './周报卡片'

interface NewsletterHorizontalCardProps {
  newsletter: NewsletterDisplay
  className?: string
}

export function NewsletterHorizontalCard({ newsletter, className = '' }: NewsletterHorizontalCardProps) {
  const formattedDate = new Date((newsletter.date as string) || '').toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link
      href={`/newsletter/${newsletter.slug}`}
      className={`group flex flex-shrink-0 w-full max-w-[280px] md:max-w-none rounded-card shadow-card border border-neutral-200 overflow-hidden bg-white hover:shadow-card-hover transition-shadow ${className}`}
    >
      <div className="flex w-full">
        {/* 小方图 */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-neutral-100">
          {newsletter.coverImage ? (
            <Image
              src={newsletter.coverImage}
              alt={newsletter.title ?? ''}
              fill
              sizes="96px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl opacity-30" aria-hidden>
              📄
            </div>
          )}
        </div>
        {/* 标题 + 日期 */}
        <div className="flex-1 min-w-0 p-3 md:p-4 flex flex-col justify-center">
          <h3 className="text-sm md:text-base font-semibold text-neutral-800 line-clamp-2 group-hover:text-primary-blue transition-colors">
            {newsletter.title ?? '未命名'}
          </h3>
          <p className="text-xs text-neutral-500 mt-1">{formattedDate}</p>
        </div>
      </div>
    </Link>
  )
}
