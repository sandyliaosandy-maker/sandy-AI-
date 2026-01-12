/**
 * 会员专享标签组件
 * 用于在内容列表页标记付费内容
 */

import { Crown } from '@/components/界面组件/图标'

interface PremiumBadgeProps {
  className?: string
}

export function PremiumBadge({ className = '' }: PremiumBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-primary-blue to-primary-pink text-white text-xs font-medium rounded-full ${className}`}
    >
      <Crown className="h-3 w-3" />
      会员专享
    </span>
  )
}
