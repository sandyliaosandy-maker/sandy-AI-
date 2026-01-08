/**
 * 周报卡片组件
 * 
 * 功能：
 * - 显示周报的封面图、标题、日期、标签等信息
 * - 支持点击跳转到周报详情页
 * - 响应式设计，适配不同屏幕尺寸
 * 
 * @param newsletter - 周报数据对象
 * @param className - 可选的额外 CSS 类名
 */
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Tag, ArrowRight } from '@/components/界面组件/图标'
import type { Newsletter } from '../../.contentlayer/generated'

interface NewsletterCardProps {
  newsletter: Newsletter // 周报数据
  className?: string // 可选的额外 CSS 类名
}

export function NewsletterCard({ newsletter, className = '' }: NewsletterCardProps) {
  // 格式化日期为中文格式（例如：2026年1月7日）
  const formattedDate = new Date(newsletter.date as string).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className={`group ${className}`}>
      <Link href={`/newsletter/${newsletter.slug}`} className="block">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
          {/* 封面图 */}
          {newsletter.coverImage && (
            <div className="relative w-full h-48 md:h-64 overflow-hidden">
              <Image
                src={newsletter.coverImage}
                alt={newsletter.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          <div className="p-6">
            {/* 标题 */}
            <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-3 group-hover:text-primary-pink transition-colors line-clamp-2">
              {newsletter.title}
            </h2>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <time>{formattedDate}</time>
              </div>
              {newsletter.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4" />
                  {newsletter.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary-blue/20 text-primary-blue rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {newsletter.tags.length > 3 && (
                    <span className="text-neutral-500 text-xs">
                      +{newsletter.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 内容预览 */}
            {/* 如果有卷首语，显示前 150 个字符的预览 */}
            {newsletter.editorialContent && 'code' in newsletter.editorialContent && newsletter.editorialContent.code && (
              <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                {newsletter.editorialContent.code
                  .replace(/[#*\[\]()]/g, '') // 移除 Markdown 语法符号
                  .replace(/\n/g, ' ') // 将换行符替换为空格
                  .substring(0, 150)} {/* 截取前 150 个字符 */}
                ...
              </p>
            )}

            {/* 包含的内容数量 */}
            {newsletter.includedItems && (() => {
              try {
                const items = typeof newsletter.includedItems === 'string' 
                  ? JSON.parse(newsletter.includedItems) 
                  : newsletter.includedItems
                if (Array.isArray(items) && items.length > 0) {
                  return (
                    <p className="text-xs text-neutral-500 mb-4">
                      包含 {items.length} 条精选内容
                    </p>
                  )
                }
              } catch {
                // 解析失败，忽略
              }
              return null
            })()}

            {/* 阅读链接 */}
            <div className="flex items-center text-primary-blue group-hover:text-primary-pink transition-colors font-medium text-sm">
              阅读完整周报
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

