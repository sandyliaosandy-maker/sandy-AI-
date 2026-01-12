/**
 * 认证工具函数
 * 用于用户认证相关的辅助功能
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDatabase } from './db'
import type { User } from './db/schema'

/**
 * 获取当前登录用户
 * @returns 用户信息或 null
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return null
    }

    const db = await getDatabase()
    const users = await db.query<User>(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [session.user.email]
    )

    return users[0] || null
  } catch (error) {
    console.error('[Auth] 获取当前用户失败:', error)
    return null
  }
}

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * 获取用户 ID
 * @returns 用户 ID 或 null
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}
