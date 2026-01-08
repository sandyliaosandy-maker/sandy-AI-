'use client'

/**
 * 周报访问统计组件
 * 
 * 功能：
 * - 在客户端收集用户访问信息
 * - 发送访问统计到后端 API
 * - 收集屏幕分辨率、视口大小等信息
 * 
 * @param newsletterSlug - 周报的 slug
 */
import { useEffect } from 'react'

interface NewsletterAnalyticsProps {
  newsletterSlug: string
}

export default function NewsletterAnalytics({ newsletterSlug }: NewsletterAnalyticsProps) {
  useEffect(() => {
    // 收集客户端信息
    const screenResolution = `${window.screen.width}x${window.screen.height}`
    const viewport = `${window.innerWidth}x${window.innerHeight}`

    // 发送访问统计
    fetch('/api/analytics/newsletter-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newsletterSlug,
        screenResolution,
        viewport,
      }),
    }).catch((error) => {
      // 静默失败，不影响用户体验
      console.error('[访问统计] 发送失败:', error)
    })
  }, [newsletterSlug])

  // 此组件不渲染任何内容
  return null
}


