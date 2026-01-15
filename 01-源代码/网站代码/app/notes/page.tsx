/**
 * 笔记列表页面
 * 路径: /notes
 * 
 * 功能：
 * - 显示所有笔记列表
 * - 按日期倒序排列（最新的在前）
 * - 支持空状态显示（没有笔记时显示提示信息）
 * - 响应式布局，适配不同屏幕尺寸
 */
import { PostList } from '@/components/内容组件/文章列表'
import type { Note } from '../../.contentlayer/generated'

/**
 * 获取笔记数据
 * 
 * 功能：
 * - 动态导入 Contentlayer 生成的数据
 * - 处理生成文件不存在或导入失败的情况
 * - 返回笔记数组，如果导入失败则返回空数组
 * 
 * @returns {Promise<Array>} 笔记数组，如果导入失败则返回空数组
 * 
 * @remarks
 * 使用动态导入（dynamic import）而不是静态导入，原因：
 * 1. Contentlayer 生成的文件可能在构建时不存在
 * 2. 开发模式下，Contentlayer 会在文件变化时重新生成
 * 3. 动态导入可以优雅地处理文件不存在的情况
 */
async function getNotes() {
  try {
    // 动态导入 Contentlayer 生成的数据
    // webpack 别名配置会将此路径解析为 .contentlayer/generated/index.mjs
    const { allNotes } = await import('../../.contentlayer/generated')
    return allNotes || []
  } catch (error) {
    // Contentlayer 数据尚未生成或导入失败，返回空数组
    // 这样页面仍然可以正常渲染，只是显示空状态
    console.error('[笔记列表页] Contentlayer 导入错误:', error)
    return []
  }
}

/**
 * 笔记列表页面组件
 * 
 * 功能：
 * - 显示所有笔记列表
 * - 按日期倒序排列（最新的在前）
 * - 支持空状态显示（没有笔记时显示提示信息）
 * - 响应式布局，适配不同屏幕尺寸
 * 
 * @returns {Promise<JSX.Element>} 笔记列表页面 JSX 元素
 * 
 * @remarks
 * 这是一个 Server Component，在服务器端渲染。
 * 使用 async/await 获取 Contentlayer 数据，支持静态生成（SSG）。
 */
export default async function NotesPage() {
  // 调试日志：确认页面组件是否被执行
  console.log('[笔记列表页 /notes] 页面组件执行')
  
  // 获取笔记数据
  const allNotes = await getNotes()
  
  // 调试日志：输出获取到的笔记数量
  console.log('[笔记列表页 /notes] 获取到笔记数量:', allNotes.length)
  
  // 使用 Contentlayer 数据（如果可用，否则使用占位数据）
  const notes = allNotes.length > 0
    ? allNotes.sort(
        (a: Note, b: Note) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
          笔记
        </h1>
        <p className="text-neutral-600 text-lg">
          记录我的思考、学习和分享
        </p>
      </div>

      {/* 笔记列表 */}
      <PostList posts={notes} />
    </div>
  )
}
