/**
 * 检查用户订阅状态 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { hasActiveSubscription } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    const targetUserId = userId || (await getCurrentUser())?.id

    if (!targetUserId) {
      return NextResponse.json({
        hasSubscription: false,
        message: '用户未登录',
      })
    }

    const hasSubscription = await hasActiveSubscription(targetUserId)

    return NextResponse.json({
      hasSubscription,
      message: hasSubscription ? '用户已订阅' : '用户未订阅',
    })
  } catch (error) {
    console.error('[Subscription Check] 检查订阅状态失败:', error)
    return NextResponse.json(
      {
        hasSubscription: false,
        error: error instanceof Error ? error.message : '检查失败',
      },
      { status: 500 }
    )
  }
}
