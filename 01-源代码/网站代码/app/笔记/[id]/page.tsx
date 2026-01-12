import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Tag, ArrowLeft } from '@/components/界面组件/图标'
import { allNotes, allNews, type News, type Note } from '../../../.contentlayer/generated'
import { MDXContent } from '@/components/内容组件/内容渲染'
// 暂时注释掉付费内容相关功能（支付功能暂不开发）
// import { PremiumBadge } from '@/components/内容组件/会员标签'
// import { PremiumContentPreview } from '@/components/内容组件/付费内容预览'
// import { checkContentAccess } from '@/lib/access-control'
// import { getCurrentUser } from '@/lib/auth'

interface PageProps {
  params: {
    id: string
  }
}

// 元信息组件
function PostMetadata({ post }: { post: News | Note }) {
  const formattedDate = new Date(post.date as string).toLocaleDateString('zh-CN')
  
  return (
    <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-neutral-600">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <time>{formattedDate}</time>
      </div>
      {post.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-4 w-4" />
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 bg-primary-blue/20 text-primary-blue rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {'source' in post && post.source && (
        <span className="px-2 py-1 bg-neutral-200 rounded-full">
          {post.source}
        </span>
      )}
    </div>
  )
}

export async function generateStaticParams() {
  // 生成所有笔记和新闻的静态路径
  const noteParams = allNotes.map((note: Note) => ({
    id: note.slug,
  }))
  const newsParams = allNews.map((news: News) => ({
    id: news.slug,
  }))
  return [...noteParams, ...newsParams]
}

export default async function NoteDetailPage({ params }: PageProps) {
  // 查找笔记或新闻（使用 slug）
  const note = allNotes.find((n: Note) => n.slug === params.id)
  const news = allNews.find((n: News) => n.slug === params.id)
  
  if (!note && !news) {
    notFound()
  }

  const post: News | Note = (note || news)!
  const isNote = !!note

  // 暂时注释掉付费内容检查（支付功能暂不开发）
  // const isPremium = (post as any).isPremium === true
  // const previewLength = (post as any).previewLength || 500
  // const user = await getCurrentUser()
  // const accessResult = await checkContentAccess(isPremium, user?.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 返回按钮 */}
      <Link
        href={isNote ? '/笔记' : '/'}
        className="inline-flex items-center text-neutral-600 hover:text-neutral-800 mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回
      </Link>

      {/* 文章头部 */}
      <article>
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 flex-1">
            {post.title}
          </h1>
          {/* 暂时注释掉付费标签（支付功能暂不开发） */}
          {/* {isPremium && <PremiumBadge />} */}
        </div>

        {/* 元信息 */}
        <PostMetadata post={post} />

        {/* 缩略图 */}
        {'thumbnail' in post && post.thumbnail && typeof post.thumbnail === 'string' ? (
          <div className="mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.thumbnail}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-auto"
            />
          </div>
        ) : null}

        {/* 摘要 */}
        {'summary' in post && post.summary ? (
          <div className="bg-primary-green/20 rounded-lg p-4 mb-8">
            <p className="text-neutral-700">{post.summary}</p>
          </div>
        ) : null}

        {/* 正文内容 */}
        {post.body && (
          <MDXContent code={post.body.code} />
        )}
      </article>
    </div>
  )
}

