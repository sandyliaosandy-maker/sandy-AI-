/**
 * 周报列表组件
 * 
 * 功能：
 * - 以网格布局显示多个周报卡片
 * - 根据周报数量自动调整列数（响应式设计）
 * - 处理空状态显示
 * 
 * @param newsletters - 周报数组
 * @param className - 可选的额外 CSS 类名
 */
import { NewsletterCard } from './周报卡片'
import type { Newsletter } from '../../.contentlayer/generated'

interface NewsletterListProps {
  newsletters: Newsletter[] // 周报数组
  className?: string // 可选的额外 CSS 类名
}

export function NewsletterList({ newsletters, className = '' }: NewsletterListProps) {
  // 空状态：如果没有周报，显示提示信息
  if (newsletters.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-12">
        <p>暂无周报</p>
      </div>
    )
  }

  /**
   * 根据周报数量调整网格列数
   * - 1 个：单列
   * - 2 个：中等屏幕以上显示 2 列
   * - 3 个以上：中等屏幕显示 2 列，大屏幕显示 3 列
   */
  const getGridCols = () => {
    if (newsletters.length === 1) return 'grid-cols-1'
    if (newsletters.length === 2) return 'grid-cols-1 md:grid-cols-2'
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  return (
    <div className={`grid ${getGridCols()} gap-6 ${className}`}>
      {newsletters.map((newsletter) => (
        <NewsletterCard key={newsletter.slug} newsletter={newsletter} />
      ))}
    </div>
  )
}

