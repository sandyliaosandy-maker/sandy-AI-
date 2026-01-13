/**
 * 订阅页面
 * 显示订阅套餐和支付选项
 */

'use client'

import { useState, useEffect } from 'react'
// 暂时注释掉 next-auth（支付功能暂不开发）
// import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
// 直接从 lucide-react 导入图标（避免图标组件导出问题）
import { Crown, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionPlan {
  id: 'monthly' | 'yearly'
  name: string
  price: number
  period: string
  features: string[]
  popular?: boolean
}

const plans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: '月度会员',
    price: 29,
    period: '月',
    features: [
      '解锁所有付费内容',
      '完整深度分析',
      '独家洞察报告',
      '案例研究详情',
      '趋势预测报告',
    ],
  },
  {
    id: 'yearly',
    name: '年度会员',
    price: 299,
    period: '年',
    features: [
      '解锁所有付费内容',
      '完整深度分析',
      '独家洞察报告',
      '案例研究详情',
      '趋势预测报告',
      '优先客服支持',
      '专属会员社区',
    ],
    popular: true,
  },
]

export default function SubscribePage() {
  // 暂时注释掉 useSession（支付功能暂不开发）
  // const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [status] = useState<'unauthenticated'>('unauthenticated')
  const session = null

  useEffect(() => {
    // 暂时注释掉认证检查（支付功能暂不开发）
    /*
    if (status === 'unauthenticated') {
      router.push('/登录?redirect=/订阅')
      return
    }

    if (status === 'authenticated') {
      // 获取当前订阅状态
      fetch('/api/subscriptions')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.subscription) {
            setSubscription(data.subscription)
          }
        })
        .catch(console.error)
    }
    */
  }, [status, router])

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    // 暂时注释掉认证检查（支付功能暂不开发）
    /*
    if (!session) {
      router.push('/登录?redirect=/订阅')
      return
    }
    */

    setLoading(true)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })

      const result = await response.json()

      if (result.success && result.url) {
        // 重定向到 Stripe Checkout
        window.location.href = result.url
      } else {
        alert('订阅失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      console.error('订阅失败:', error)
      alert('订阅失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 暂时注释掉加载状态检查（支付功能暂不开发）
  // if (status === 'loading') {
  if (false) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
        </div>
      </div>
    )
  }

  // 暂时注释掉认证检查（支付功能暂不开发）
  // if (!session) {
  if (false) {
    return null // 会重定向到登录页
  }

  // 如果已有有效订阅
  if (subscription && subscription.status === 'active') {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <Crown className="h-16 w-16 text-primary-blue mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">您已是会员</h1>
            <p className="text-neutral-600">
              当前套餐：{subscription.planType === 'monthly' ? '月度会员' : '年度会员'}
            </p>
            {subscription.currentPeriodEnd && (
              <p className="text-sm text-neutral-500 mt-2">
                到期时间：{new Date(subscription.currentPeriodEnd).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-800 mb-4">
          成为会员，解锁完整内容
        </h1>
        <p className="text-xl text-neutral-600">
          订阅后即可查看所有付费内容的完整版本
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow-lg p-8 border-2 ${
              plan.popular
                ? 'border-primary-blue relative'
                : 'border-neutral-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                  推荐
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-800 mb-2">{plan.name}</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-primary-blue">¥{plan.price}</span>
                <span className="text-neutral-600">/{plan.period}</span>
              </div>
              {plan.id === 'yearly' && (
                <p className="text-sm text-neutral-500 mt-2">
                  相当于 ¥{Math.round(plan.price / 12)}/月，节省 {Math.round((1 - plan.price / (29 * 12)) * 100)}%
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary-green flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-primary-blue text-white hover:bg-primary-blue/90'
                  : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Crown className="h-5 w-5" />
                  立即订阅
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-neutral-500">
        <p>支持随时取消订阅，取消后仍可享受至当前计费周期结束</p>
      </div>
    </div>
  )
}
