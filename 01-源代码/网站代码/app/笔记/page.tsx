import { PostList } from '@/components/内容组件/文章列表'
import { allNotes, type Note } from '../../.contentlayer/generated'

export default function NotesPage() {
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

