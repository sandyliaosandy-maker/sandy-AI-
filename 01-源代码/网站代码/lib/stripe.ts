/**
 * Stripe 工具函数
 * 用于处理 Stripe 支付相关的操作
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

/**
 * 创建或获取 Stripe 客户
 */
export async function getOrCreateCustomer(
  email: string,
  userId: string
): Promise<Stripe.Customer> {
  const db = await import('./db').then((m) => m.getDatabase())

  // 检查数据库中是否已有 customer_id
  const subscriptions = await db.query<{ stripe_customer_id: string | null }>(
    'SELECT stripe_customer_id FROM subscriptions WHERE user_id = $1 LIMIT 1',
    [userId]
  )

  if (subscriptions[0]?.stripe_customer_id) {
    // 如果已有 customer_id，从 Stripe 获取
    try {
      return await stripe.customers.retrieve(subscriptions[0].stripe_customer_id) as Stripe.Customer
    } catch {
      // 如果获取失败，创建新的
    }
  }

  // 创建新的 Stripe 客户
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  })

  // 更新数据库
  await db.execute(
    'UPDATE subscriptions SET stripe_customer_id = $1 WHERE user_id = $2',
    [customer.id, userId]
  )

  return customer
}

/**
 * 创建订阅 Checkout Session
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string
): Promise<Stripe.Checkout.Session> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3003'

  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${baseUrl}/订阅?success=true`,
    cancel_url: `${baseUrl}/订阅?canceled=true`,
    metadata: {
      userId,
    },
  })
}

/**
 * 创建客户门户会话（用于管理订阅）
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}
