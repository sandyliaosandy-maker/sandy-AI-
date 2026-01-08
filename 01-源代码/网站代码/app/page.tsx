/**
 * 首页组件
 * 
 * 功能：
 * - 显示所有已发布的周报列表
 * - 按日期倒序排列（最新的在前）
 * - 支持空状态显示（没有周报时显示提示信息）
 * - 响应式布局，适配不同屏幕尺寸
 */
import { NewsletterList } from '@/components/内容组件/周报列表'

// 动态导入 Contentlayer 数据，处理生成文件不存在的情况
async function getNewsletters() {
  try {
    const { allNewsletters } = await import('../.contentlayer/generated')
    return allNewsletters || []
  } catch (error) {
    // Contentlayer 数据尚未生成，返回空数组
    return []
  }
}

export default async function Home() {
  // 获取周报数据
  const allNewsletters = await getNewsletters()
  /**
   * 获取已发布的所有周报
   * 
   * 筛选逻辑：
   * - published 字段可能是 undefined、true 或 false
   * - 只有明确为 false 时才过滤掉
   * - undefined 和 true 都视为已发布
   */
  const publishedNewsletters = allNewsletters
    .filter((n: any) => {
      const isPublished = n.published !== false
      return isPublished
    })
    /**
     * 按日期倒序排序（最新的在前）
     * 将日期字符串转换为时间戳进行比较
     */
    .sort((a: any, b: any) => {
      const dateA = new Date(a.date as string).getTime()
      const dateB = new Date(b.date as string).getTime()
      return dateB - dateA // 最新的在前
    })
  
  // 如果有周报，显示周报列表
  if (publishedNewsletters.length > 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
            周报列表
          </h1>
          <p className="text-neutral-600 text-lg">
            共 {publishedNewsletters.length} 期周报
          </p>
        </header>

        <NewsletterList newsletters={publishedNewsletters} />
      </div>
    )
  }
  
  // 如果没有周报，显示空状态
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center py-16">
        <p className="text-neutral-600 text-lg">暂无周报，请先创建周报</p>
        <p className="text-neutral-500 text-sm mt-2">
          访问 <a href="/admin" className="text-primary-blue hover:underline">管理页面</a> 创建周报
        </p>
      </div>
    </div>
  )
}

