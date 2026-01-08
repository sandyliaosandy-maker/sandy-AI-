import { Button } from '../界面组件/按钮'
import Image from 'next/image'

interface HeroProps {
  title: string
  description: string
  illustration?: string
  ctaText?: string
  ctaLink?: string
}

export function Hero({
  title,
  description,
  illustration,
  ctaText = 'READ THE LATEST',
  ctaLink,
}: HeroProps) {
  // ctaLink 暂时未使用，但保留用于未来功能
  void ctaLink // 避免未使用参数警告
  return (
    <div className="bg-primary-green rounded-hero p-8 md:p-12 relative overflow-hidden mb-12">
      {/* 装饰性浮动圆圈 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-pink/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* 左侧文字内容 */}
        <div className="order-2 md:order-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-4 leading-tight">
            {title}
          </h1>
          <p className="text-neutral-700 mb-6 text-base md:text-lg">{description}</p>
          <Button variant="primary" size="lg" icon="arrow">
            {ctaText}
          </Button>
        </div>

        {/* 右侧插画 */}
        <div className="relative order-1 md:order-2">
          {illustration && (
            <div className="bg-primary-purple/20 rounded-2xl p-4 md:p-8">
              <Image
                src={illustration}
                alt="Hero illustration"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

