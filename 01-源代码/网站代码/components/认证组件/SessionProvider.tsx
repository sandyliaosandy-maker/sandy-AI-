'use client'

// 暂时注释掉 next-auth（支付功能暂不开发）
// import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  // 暂时直接返回 children（支付功能暂不开发）
  return <>{children}</>
  // return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
