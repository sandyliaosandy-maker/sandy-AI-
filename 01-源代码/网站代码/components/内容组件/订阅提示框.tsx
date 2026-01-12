/**
 * 订阅提示框组件
 * 显示在付费内容预览下方，引导用户订阅
 */

'use client'

import Link from 'next/link'
// 暂时直接从 lucide-react 导入（支付功能暂不开发）
import { Crown, Lock } from 'lucide-react'

interface SubscribePromptProps {
  className?: string
}

export function SubscribePrompt({ className = '' }: SubscribePromptProps) {
  return (
    <div
      className={`bg-gradient-to-r from-primary-blue/10 to-primary-pink/10 border-2 border-primary-blue/30 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-primary-blue/20 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary-blue" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">
            订阅解锁完整内容
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            成为会员，即可查看所有付费内容的完整版本，包括深度分析、独家洞察和案例研究。
          </p>
          <Link
            href="/订阅"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-blue text-white rounded-lg font-medium hover:bg-primary-blue/90 transition-colors"
          >
            <Crown className="h-5 w-5" />
            立即订阅
          </Link>
        </div>
      </div>
    </div>
  )
}
