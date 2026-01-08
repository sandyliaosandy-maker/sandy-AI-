import { PostCard } from './文章卡片'
import type { MockNews, MockNote } from '@/lib/types/mock'
import type { News, Note } from '../../.contentlayer/generated'

type Post = MockNews | MockNote | News | Note

interface PostListProps {
  posts: Post[]
  className?: string
}

export function PostList({ posts, className = '' }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-12">
        <p>暂无内容</p>
      </div>
    )
  }

  // 根据文章数量调整列数
  const getGridCols = () => {
    if (posts.length === 1) return 'grid-cols-1'
    if (posts.length === 2) return 'grid-cols-1 sm:grid-cols-2'
    if (posts.length <= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  return (
    <div className={`grid ${getGridCols()} gap-6 ${className}`}>
      {posts.map((post) => {
        const key = 'slug' in post ? post.slug : ('id' in post ? post.id : 'unknown')
        return <PostCard key={key} post={post} />
      })}
    </div>
  )
}

