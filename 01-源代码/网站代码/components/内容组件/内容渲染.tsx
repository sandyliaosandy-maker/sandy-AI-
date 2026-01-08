'use client'

import { useMDXComponent } from 'next-contentlayer/hooks'
import Image from 'next/image'

interface MDXContentProps {
  code: string
}

const mdxComponents = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (!props.src || typeof props.src !== 'string') {
      return <img {...props} alt={props.alt || ''} className="rounded-lg" />
    }
    return (
      <Image
        src={props.src}
        alt={props.alt || ''}
        width={800}
        height={400}
        className="rounded-lg"
      />
    )
  },
}

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMDXComponent(code)

  return (
    <div className="prose prose-lg max-w-none">
      <Component components={mdxComponents} />
    </div>
  )
}

