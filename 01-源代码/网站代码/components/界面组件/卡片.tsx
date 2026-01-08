import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'

interface CardProps {
  title: string
  date?: string
  author?: string
  thumbnail?: string
  description?: string
  href?: string
  children?: ReactNode
  className?: string
}

export function Card({
  title,
  date,
  author,
  thumbnail,
  description,
  href,
  children,
  className = '',
}: CardProps) {
  const cardContent = (
    <div
      className={`bg-white rounded-card p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200 ${className}`}
    >
      {thumbnail && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <Image
            src={thumbnail}
            alt={title}
            width={400}
            height={240}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      <h3 className="text-xl font-semibold text-neutral-800 mb-2">{title}</h3>
      {description && (
        <p className="text-neutral-600 mb-4 line-clamp-2">{description}</p>
      )}
      <div className="flex items-center justify-between text-sm text-neutral-500">
        {date && <time>{new Date(date).toLocaleDateString('zh-CN')}</time>}
        {author && <span>{author}</span>}
      </div>
      {children}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}



