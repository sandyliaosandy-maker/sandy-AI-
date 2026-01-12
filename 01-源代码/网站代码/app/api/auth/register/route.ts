/**
 * 用户注册 API
 * 处理邮箱+密码注册
 */

import { NextRequest, NextResponse } from 'next/server'
// 暂时注释掉相关功能（支付功能暂不开发）
// import { getDatabase } from '@/lib/db'
// import { hashPassword, checkPasswordStrength } from '@/lib/password'
// import { signIn } from 'next-auth/react'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      )
    }

    // 检查密码强度
    const passwordCheck = checkPasswordStrength(password)
    if (!passwordCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: '密码不符合要求',
          details: passwordCheck.errors,
        },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // 检查邮箱是否已注册
    const existingUsers = await db.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email]
    )

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 409 }
      )
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const newUsers = await db.query<{ id: string }>(
      `INSERT INTO users (email, name, created_at, updated_at) 
       VALUES ($1, $2, NOW(), NOW()) 
       RETURNING id`,
      [email, name || null]
    )

    if (newUsers.length === 0) {
      return NextResponse.json(
        { success: false, error: '注册失败，请重试' },
        { status: 500 }
      )
    }

    const userId = newUsers[0].id

    // 创建账户记录（存储密码）
    await db.execute(
      `INSERT INTO accounts (
        user_id, type, provider, provider_account_id, 
        access_token, token_type
      ) VALUES ($1, 'credentials', 'credentials', $2, $3, 'Bearer')`,
      [userId, email, hashedPassword]
    )

    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: userId,
        email,
        name: name || null,
      },
    })
  } catch (error) {
    console.error('[Register] 注册失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '注册失败，请重试',
      },
      { status: 500 }
    )
  }
}
