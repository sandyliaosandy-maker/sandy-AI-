import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-100 mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* 关于 */}
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">关于</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/关于" className="hover:text-neutral-800 transition-colors">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-neutral-800 transition-colors">
                  首页
                </Link>
              </li>
            </ul>
          </div>

          {/* 链接 */}
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">链接</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/notes" className="hover:text-neutral-800 transition-colors">
                  笔记
                </Link>
              </li>
              <li>
                <a
                  href="https://zerodaybook.mikecrm.com/F10LaP5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-800 transition-colors"
                >
                  订阅
                </a>
              </li>
            </ul>
          </div>

          {/* 联系 */}
          <div>
            <h3 className="font-semibold text-neutral-800 mb-4">联系</h3>
            <p className="text-sm text-neutral-600">
              通过邮件或社交媒体联系我们
            </p>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="border-t border-neutral-200 pt-8 text-center text-sm text-neutral-600">
          <p>© {currentYear} Sandy的AI收藏夹. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

