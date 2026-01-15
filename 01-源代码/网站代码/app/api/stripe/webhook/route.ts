/**
 * Stripe Webhook 处理
 * 处理 Stripe 发送的订阅事件
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getDatabase } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET 未设置')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Webhook] 签名验证失败:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const db = await getDatabase()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string
        const userId = session.metadata?.userId

        if (!userId || !subscriptionId) {
          console.error('[Webhook] 缺少必要信息:', { userId, subscriptionId })
          break
        }

        // 获取订阅详情
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const planType = priceId === process.env.STRIPE_PRICE_ID_MONTHLY ? 'monthly' : 'yearly'

        // 保存或更新订阅信息
        await db.execute(
          `INSERT INTO subscriptions (
            user_id, stripe_subscription_id, stripe_customer_id,
            status, plan_type, current_period_start, current_period_end
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (stripe_subscription_id) 
          DO UPDATE SET
            status = $4,
            plan_type = $5,
            current_period_start = $6,
            current_period_end = $7,
            updated_at = NOW()`,
          [
            userId,
            subscriptionId,
            customerId,
            subscription.status,
            planType,
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
          ]
        )

        console.log('[Webhook] 订阅创建成功:', { userId, subscriptionId })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // 更新订阅状态
        await db.execute(
          `UPDATE subscriptions 
           SET status = $1,
               current_period_start = $2,
               current_period_end = $3,
               cancel_at_period_end = $4,
               updated_at = NOW()
           WHERE stripe_subscription_id = $5`,
          [
            subscription.status,
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
            subscription.cancel_at_period_end,
            subscription.id,
          ]
        )

        console.log('[Webhook] 订阅更新成功:', { subscriptionId: subscription.id, status: subscription.status })
        break
      }

      default:
        console.log('[Webhook] 未处理的事件类型:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] 处理事件失败:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
