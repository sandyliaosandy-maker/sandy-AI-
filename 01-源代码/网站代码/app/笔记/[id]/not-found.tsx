import Link from 'next/link'
import { Button } from '@/components/界面组件/按钮'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
      <h1 className="text-4xl font-bold text-neutral-800 mb-4">404</h1>
      <p className="text-xl text-neutral-600 mb-8">页面未找到</p>
      <p className="text-neutral-500 mb-8">
        抱歉，您访问的笔记不存在或已被删除。
      </p>
      <Link href="/笔记">
        <Button variant="primary" size="md" icon="arrow">
          返回笔记列表
        </Button>
      </Link>
    </div>
  )
}



