'use client'

import { Button } from '../界面组件/按钮'

export function NewsletterSection() {
  const handleSubscribe = () => {
    // 跳转到订阅页面
    window.open('https://zerodaybook.mikecrm.com/F10LaP5', '_blank')
  }

  return (
    <div className="bg-white rounded-card p-6 md:p-8 shadow-card">
      <h3 className="text-xl font-semibold text-neutral-800 mb-4">
        Sandy的AI观察报
      </h3>
      <p className="text-neutral-600 mb-6">
        订阅我们的周报，每周获取最新的 AI 工具、商业洞察和增长技巧。
      </p>
      <div className="mb-6">
        <a
          href="https://zerodaybook.mikecrm.com/F10LaP5"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-blue hover:underline text-sm"
        >
          https://zerodaybook.mikecrm.com/F10LaP5
        </a>
      </div>
      <Button variant="secondary" size="md" icon="check" onClick={handleSubscribe}>
        Subscribed
      </Button>
    </div>
  )
}

