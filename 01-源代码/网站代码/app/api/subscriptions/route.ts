/**
 * 订阅管理 API
 * 处理订阅创建、查询、取消等操作
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'
import { getOrCreateCustomer, createCheckoutSession } from '@/lib/stripe'
// createPortalSession 和 getDatabase 暂未使用，但保留以备将来使用
// import { createPortalSession } from '@/lib/stripe'
// import { getDatabase } from '@/lib/db'

/**
 * GET - 获取用户订阅信息
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      )
    }

    const subscription = await getUserSubscription(user.id)

    return NextResponse.json({
      success: true,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            planType: subscription.plan_type,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        : null,
    })
  } catch (error) {
    console.error('[Subscription] 获取订阅信息失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取失败',
      },
      { status: 500 }
    )
  }
}

/**
 * POST - 创建订阅（创建 Checkout Session）
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      )
    }

    const { planType } = await request.json()

    if (!planType || !['monthly', 'yearly'].includes(planType)) {
      return NextResponse.json(
        { success: false, error: '无效的套餐类型' },
        { status: 400 }
      )
    }

    // 获取价格 ID（从环境变量或配置中）
    const priceId =
      planType === 'monthly'
        ? process.env.STRIPE_PRICE_ID_MONTHLY
        : process.env.STRIPE_PRICE_ID_YEARLY

    if (!priceId) {
      return NextResponse.json(
        { success: false, error: '价格配置未设置' },
        { status: 500 }
      )
    }

    // 创建或获取 Stripe 客户
    const customer = await getOrCreateCustomer(user.email!, user.id)

    // 创建 Checkout Session
    const session = await createCheckoutSession(customer.id, priceId, user.id)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('[Subscription] 创建订阅失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '创建失败',
      },
      { status: 500 }
    )
  }
}
