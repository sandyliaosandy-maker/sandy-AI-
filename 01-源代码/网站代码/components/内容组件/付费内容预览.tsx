/**
 * 付费内容预览组件
 * 显示截断的内容和订阅提示
 */

'use client'

import { truncateContent } from '@/lib/content-truncate'
import { SubscribePrompt } from './订阅提示框'

interface PremiumContentPreviewProps {
  content: string
  previewLength?: number
  isSubscribed: boolean
  className?: string
}

export function PremiumContentPreview({
  content,
  previewLength = 500,
  isSubscribed,
  className = '',
}: PremiumContentPreviewProps) {
  // 如果已订阅，显示完整内容
  if (isSubscribed) {
    return (
      <div className={className}>
        <div className="prose max-w-none">{content}</div>
      </div>
    )
  }

  // 未订阅，显示预览
  const truncated = truncateContent(content, previewLength)
  const isTruncated = content.length > truncated.length

  return (
    <div className={className}>
      <div className="prose max-w-none">
        <div className="relative">
          {truncated}
          {isTruncated && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>
      </div>
      {isTruncated && (
        <div className="mt-6">
          <SubscribePrompt />
        </div>
      )}
    </div>
  )
}
