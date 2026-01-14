import { Card } from '../界面组件/卡片'
import type { MockNews, MockNote } from '@/lib/types/mock'
import type { News, Note } from '../../.contentlayer/generated'

type Post = MockNews | MockNote | News | Note

interface PostCardProps {
  post: Post
  className?: string
}

export function PostCard({ post, className = '' }: PostCardProps) {
  // 判断是笔记还是新闻，使用不同的路由
  // Contentlayer 类型有 slug，占位数据有 id
  const slug = 'slug' in post ? post.slug : ('id' in post ? post.id : '')
  const isNote = 'source' in post || ('_id' in post && post._id.startsWith('Note'))
  const href = isNote ? `/notes/${slug}` : `/新闻/${slug}`

  // 获取缩略图（Contentlayer 类型中没有 thumbnail，需要从 _raw 或其他地方获取）
  const thumbnail = 'thumbnail' in post ? post.thumbnail : undefined

  return (
    <Card
      title={post.title}
      date={post.date}
      thumbnail={thumbnail}
      description={'summary' in post ? post.summary : undefined}
      href={href}
      className={className}
    >
      {'tags' in post && post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-primary-blue/20 text-primary-blue rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

