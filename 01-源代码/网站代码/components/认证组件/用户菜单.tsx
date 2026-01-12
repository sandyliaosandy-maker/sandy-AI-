'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// 暂时注释掉认证相关功能（支付功能暂不开发）
// import { signOut } from 'next-auth/react'
// import { User, LogOut, Crown } from '@/components/界面组件/图标'
import { User, LogOut, Crown } from 'lucide-react'
import Link from 'next/link'

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    id?: string
  }
  mobile?: boolean
}

export function UserMenu({ user, mobile = false }: UserMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)

  // 检查订阅状态（客户端）
  useEffect(() => {
    if (user.id) {
      fetch(`/api/subscriptions/check?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setHasSubscription(data.hasSubscription || false))
        .catch(() => setHasSubscription(false))
    }
  }, [user.id])

  const handleSignOut = async () => {
    // 暂时注释掉（支付功能暂不开发）
    // await signOut({ callbackUrl: '/' })
    console.log('Sign out (disabled)')
  }

  if (mobile) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-neutral-600">
          <User className="h-4 w-4" />
          <span>{user.name || user.email}</span>
        </div>
        {hasSubscription && (
          <div className="flex items-center gap-2 text-primary-blue">
            <Crown className="h-4 w-4" />
            <span className="text-sm">已订阅</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary-blue flex items-center justify-center text-white">
            <User className="h-4 w-4" />
          </div>
        )}
        <span className="text-sm text-neutral-700">{user.name || user.email}</span>
        {hasSubscription && <Crown className="h-4 w-4 text-primary-blue" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-20">
            <div className="px-4 py-2 border-b border-neutral-200">
              <p className="text-sm font-medium text-neutral-800">{user.name || '用户'}</p>
              <p className="text-xs text-neutral-500">{user.email}</p>
            </div>
            {hasSubscription && (
              <div className="px-4 py-2 border-b border-neutral-200">
                <div className="flex items-center gap-2 text-sm text-primary-blue">
                  <Crown className="h-4 w-4" />
                  <span>已订阅会员</span>
                </div>
              </div>
            )}
            <Link
              href="/订阅"
              className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                订阅管理
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  )
}
