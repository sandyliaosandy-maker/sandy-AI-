/**
 * 管理页：服务端包装，显式接收 searchParams 使路由按需动态渲染，避免静态渲染时报 searchParams.toJSON
 */
import { AdminPageClient } from './AdminPageClient'

type SearchParams = { [key: string]: string | string[] | undefined }

export default function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  // 仅用于声明依赖 searchParams，使本页不被静态预渲染
  void searchParams
  return <AdminPageClient />
}
