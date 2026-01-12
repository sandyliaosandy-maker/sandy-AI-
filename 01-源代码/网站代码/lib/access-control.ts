/**
 * 访问控制逻辑
 * 检查用户是否有权限访问特定内容
 */

import { hasActiveSubscription } from './subscription'

export interface ContentAccessResult {
  canAccess: boolean
  reason?: 'free' | 'subscribed' | 'premium_required'
  isPremium: boolean
}

/**
 * 检查用户是否可以访问内容
 * @param isPremium 内容是否为付费内容
 * @param userId 用户 ID（可选）
 * @returns 访问控制结果
 */
export async function checkContentAccess(
  isPremium: boolean,
  userId?: string
): Promise<ContentAccessResult> {
  // 如果是免费内容，所有用户都可以访问
  if (!isPremium) {
    return {
      canAccess: true,
      reason: 'free',
      isPremium: false,
    }
  }

  // 如果是付费内容，检查用户是否有有效订阅
  const hasSubscription = await hasActiveSubscription(userId)

  if (hasSubscription) {
    return {
      canAccess: true,
      reason: 'subscribed',
      isPremium: true,
    }
  }

  // 付费内容但未订阅
  return {
    canAccess: false,
    reason: 'premium_required',
    isPremium: true,
  }
}
