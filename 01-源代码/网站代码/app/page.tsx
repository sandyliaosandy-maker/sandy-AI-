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

/**
 * 获取周报数据
 * 
 * 功能：
 * - 动态导入 Contentlayer 生成的数据
 * - 处理生成文件不存在或导入失败的情况
 * - 返回周报数组，如果导入失败则返回空数组
 * 
 * @returns {Promise<Array>} 周报数组，如果导入失败则返回空数组
 * 
 * @remarks
 * 使用动态导入（dynamic import）而不是静态导入，原因：
 * 1. Contentlayer 生成的文件可能在构建时不存在
 * 2. 开发模式下，Contentlayer 会在文件变化时重新生成
 * 3. 动态导入可以优雅地处理文件不存在的情况
 */
async function getNewsletters() {
  try {
    // 动态导入 Contentlayer 生成的数据
    // webpack 别名配置会将此路径解析为 .contentlayer/generated/index.mjs
    const { allNewsletters } = await import('../.contentlayer/generated')
    return allNewsletters || []
  } catch (error) {
    // Contentlayer 数据尚未生成或导入失败，返回空数组
    // 这样页面仍然可以正常渲染，只是显示空状态
    console.error('[首页] Contentlayer 导入错误:', error)
    return []
  }
}

/**
 * 首页组件
 * 
 * 功能：
 * - 显示所有已发布的周报列表
 * - 按日期倒序排列（最新的在前）
 * - 支持空状态显示（没有周报时显示提示信息）
 * - 响应式布局，适配不同屏幕尺寸
 * 
 * @returns {Promise<JSX.Element>} 首页 JSX 元素
 * 
 * @remarks
 * 这是一个 Server Component，在服务器端渲染。
 * 使用 async/await 获取 Contentlayer 数据，支持静态生成（SSG）。
 */
export default async function Home() {
  // 获取周报数据
  const allNewsletters = await getNewsletters()
  
  /**
   * 筛选和排序已发布的周报
   * 
   * 筛选逻辑：
   * - published 字段可能是 undefined、true 或 false
   * - 只有明确为 false 时才过滤掉
   * - undefined 和 true 都视为已发布
   * 
   * 排序逻辑：
   * - 按日期倒序排序（最新的在前）
   * - 将日期字符串转换为时间戳进行比较
   * 
   * @type {Array<Newsletter>}
   */
  const publishedNewsletters = allNewsletters
    .filter((n) => {
      const isPublished = n.published !== false
      return isPublished
    })
    .sort((a, b) => {
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

