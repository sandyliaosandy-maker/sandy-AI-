/**
 * 密码工具函数
 * 用于密码加密、验证和强度检查
 */

import bcrypt from 'bcryptjs'

/**
 * 加密密码
 * @param password 原始密码
 * @returns 加密后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * 验证密码
 * @param password 原始密码
 * @param hashedPassword 加密后的密码
 * @returns 是否匹配
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * 检查密码强度
 * @param password 密码
 * @returns 强度检查结果
 */
export interface PasswordStrength {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const errors: string[] = []
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  // 最小长度检查
  if (password.length < 8) {
    errors.push('密码长度至少为 8 位')
  }

  // 包含字母检查
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('密码必须包含至少一个字母')
  }

  // 包含数字检查
  if (!/[0-9]/.test(password)) {
    errors.push('密码必须包含至少一个数字')
  }

  // 强度评估
  if (password.length >= 12 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)) {
    strength = 'strong'
  } else if (password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password)) {
    strength = 'medium'
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  }
}
