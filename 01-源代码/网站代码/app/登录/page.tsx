'use client'

import { useState } from 'react'
// 暂时注释掉 useRouter（支付功能暂不开发）
// import { useRouter } from 'next/navigation'
import Link from 'next/link'
// 暂时注释掉 next-auth（支付功能暂不开发）
// import { signIn } from 'next-auth/react'
import { Loader2, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  // 暂时注释掉 router（支付功能暂不开发）
  // const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 暂时注释掉登录功能（支付功能暂不开发）
      /*
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? '邮箱或密码错误' : result.error)
      } else {
        // 登录成功，重定向到首页或原页面
        router.push('/')
        router.refresh()
      }
      */
      // 暂时显示提示信息
      setError('登录功能暂未开放，请稍后再试')
    } catch (err) {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-neutral-800">登录</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              邮箱
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-blue text-white rounded-lg font-medium hover:bg-primary-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-600">
          还没有账号？{' '}
          <Link href="/注册" className="text-primary-blue hover:text-primary-pink font-medium">
            立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}
