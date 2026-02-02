'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
// 暂时注释掉认证相关功能（支付功能暂不开发）
// import { useSession, signOut } from 'next-auth/react'
// import { Menu, X, User, LogOut, Crown } from '@/components/界面组件/图标'
// import { UserMenu } from '@/components/认证组件/用户菜单'
import { Menu, X } from '@/components/界面组件/图标'

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // 暂时注释掉认证相关功能（支付功能暂不开发）
  // const { data: session } = useSession()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/notes', label: '笔记' },
    { href: '/about', label: '关于' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between md:grid md:grid-cols-3 md:gap-4">
          {/* Logo/标题 左 */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-neutral-800 hover:text-primary-blue transition-colors md:col-start-1">
            Sandy的AI观察报
          </Link>

          {/* 桌面端导航链接 居中 */}
          <div className="hidden md:flex items-center justify-center gap-6 md:col-start-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors pb-1 border-b-2 ${isActive ? 'text-primary-blue font-medium border-primary-blue' : 'text-neutral-600 hover:text-neutral-800 border-transparent'}`}
                >
                  {link.label}
                </Link>
              )
            })}
            {/* 暂时注释掉用户菜单（支付功能暂不开发） */}
            {/* {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/登录"
                  className="text-neutral-600 hover:text-neutral-800 transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/注册"
                  className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 transition-colors"
                >
                  注册
                </Link>
              </div>
            )} */}
          </div>

          {/* 右侧占位 + 移动端菜单按钮 */}
          <div className="flex justify-end md:col-start-3">
            <button
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-800"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-neutral-200">
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors ${isActive ? 'text-primary-blue font-medium' : 'text-neutral-600 hover:text-neutral-800'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                    {isActive && <span className="ml-1 text-primary-blue">·</span>}
                  </Link>
                )
              })}
              {/* 暂时注释掉用户菜单（支付功能暂不开发） */}
              {/* {session?.user ? (
                <>
                  <UserMenu user={session.user} mobile />
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' })
                      setIsMenuOpen(false)
                    }}
                    className="text-left text-neutral-600 hover:text-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/登录"
                    className="text-neutral-600 hover:text-neutral-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link
                    href="/注册"
                    className="text-neutral-600 hover:text-neutral-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    注册
                  </Link>
                </>
              )} */}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

