import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/布局组件/头部'
import { Footer } from '@/components/布局组件/页脚'
// 暂时注释掉 SessionProvider（支付功能暂不开发）
// import { SessionProvider } from '@/components/认证组件/SessionProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sandy的AI收藏夹',
  description: '个人知识库网站',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* 暂时注释掉 SessionProvider（支付功能暂不开发） */}
        {/* <SessionProvider> */}
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        {/* </SessionProvider> */}
      </body>
    </html>
  )
}

