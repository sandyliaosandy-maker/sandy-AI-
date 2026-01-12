/**
 * NextAuth 配置
 * 使用邮箱+密码认证（Credentials Provider）
 * 
 * 注意：支付功能暂不开发，暂时注释掉相关功能
 */

// 暂时注释掉 next-auth（支付功能暂不开发）
// import NextAuth, { NextAuthOptions } from 'next-auth'
// import CredentialsProvider from 'next-auth/providers/credentials'
// import { getDatabase } from '@/lib/db'
// import { verifyPassword } from '@/lib/password'
// import type { User } from '@/lib/db/schema'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('邮箱和密码不能为空')
        }

        try {
          const db = await getDatabase()
          
          // 查找用户
          const users = await db.query<User>(
            'SELECT * FROM users WHERE email = $1 LIMIT 1',
            [credentials.email]
          )

          if (users.length === 0) {
            throw new Error('邮箱或密码错误')
          }

          const user = users[0]

          // 验证密码（需要从 accounts 表获取加密的密码）
          // 注意：使用 Credentials Provider 时，密码存储在 accounts 表中
          const accounts = await db.query<{ password: string }>(
            `SELECT password FROM accounts 
             WHERE user_id = $1 
             AND provider = 'credentials' 
             LIMIT 1`,
            [user.id]
          )

          if (accounts.length === 0) {
            throw new Error('邮箱或密码错误')
          }

          const isValid = await verifyPassword(credentials.password, accounts[0].password)

          if (!isValid) {
            throw new Error('邮箱或密码错误')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('[Auth] 认证失败:', error)
          throw error
        }
      },
    }),
  ],
  pages: {
    signIn: '/登录',
    signOut: '/',
    error: '/登录',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
