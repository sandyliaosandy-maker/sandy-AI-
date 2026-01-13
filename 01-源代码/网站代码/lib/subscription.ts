/**
 * 订阅检查工具
 * 用于检查用户的订阅状态
 * 
 * 注意：支付功能暂不开发，暂时注释掉相关功能
 */

// 暂时注释掉相关导入（支付功能暂不开发）
// import { getCurrentUser } from './auth'
// import { getDatabase } from './db'
// import type { Subscription } from './db/schema'

/**
 * 检查用户是否有有效的订阅
 * @param userId 用户 ID（可选，如果不提供则从 session 获取）
 * @returns 订阅信息或 null
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserSubscription(
  _userId?: string
): Promise<null> {
  // 暂时返回 null（支付功能暂不开发）
  return null
  /*
  try {
    const targetUserId = userId || (await getCurrentUser())?.id

    if (!targetUserId) {
      return null
    }

    const db = await getDatabase()
    const subscriptions = await db.query<Subscription>(
      `SELECT * FROM subscriptions 
       WHERE user_id = $1 
       AND status = 'active' 
       AND (current_period_end IS NULL OR current_period_end > NOW())
       ORDER BY created_at DESC 
       LIMIT 1`,
      [targetUserId]
    )

    return subscriptions[0] || null
  } catch (error) {
    console.error('[Subscription] 获取订阅信息失败:', error)
    return null
  }
  */
}

/**
 * 检查用户是否有有效订阅
 * @param userId 用户 ID（可选）
 * @returns 是否有有效订阅
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function hasActiveSubscription(_userId?: string): Promise<boolean> {
  // 暂时返回 false（支付功能暂不开发）
  return false
  // const subscription = await getUserSubscription(userId)
  // return subscription !== null
}

/**
 * 检查用户是否可以访问付费内容
 * @param userId 用户 ID（可选）
 * @returns 是否可以访问
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function canAccessPremiumContent(_userId?: string): Promise<boolean> {
  // 暂时返回 false（支付功能暂不开发）
  return false
  // return hasActiveSubscription(userId)
}
